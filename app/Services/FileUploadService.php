<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload a file to the appropriate storage (S3 if configured, otherwise local)
     *
     * @param  UploadedFile  $file  The file to upload
     * @param  string  $directory  The directory path (e.g., 'verifications', 'business-images')
     * @param  string  $visibility  'public' or 'private'
     * @param  string|null  $filename  Optional custom filename (without extension)
     * @return string The stored file path
     */
    public static function upload(
        UploadedFile $file,
        string $directory,
        string $visibility = 'private',
        ?string $filename = null
    ): string {
        $useS3 = self::isS3Configured();

        // Generate filename if not provided.
        if (! $filename) {
            $filename = Str::uuid().'_'.time();
        }

        $extension = $file->getClientOriginalExtension();
        $fullFilename = $filename.'.'.$extension;

        // Pick the disk: S3 in prod, otherwise local public/private based on visibility.
        $disk = $useS3 ? 's3' : ($visibility === 'public' ? 'public' : 'private');

        return $file->storeAs($directory, $fullFilename, ['visibility' => $visibility, 'disk' => $disk]);
    }

    /**
     * Upload multiple files
     *
     * @param  array  $files  Array of UploadedFile instances
     * @param  string  $directory  The directory path
     * @param  string  $visibility  'public' or 'private'
     * @return array Array of stored file paths
     */
    public static function uploadMultiple(
        array $files,
        string $directory,
        string $visibility = 'private'
    ): array {
        $paths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = self::upload($file, $directory, $visibility);
            }
        }

        return $paths;
    }

    /**
     * Delete a file from storage.
     *
     * If $disk is not provided we try the most likely candidates so callers
     * don't have to remember which disk was used at upload time:
     *   - S3 when configured;
     *   - locally we try 'public' first then 'private' since most uploads are
     *     public-visibility business assets.
     *
     * @param  string  $path  The file path to delete
     * @param  string|null  $disk  Optional disk name (auto-detected if null)
     * @return bool True if a file was found and deleted
     */
    public static function delete(string $path, ?string $disk = null): bool
    {
        if (! $path) {
            return false;
        }

        $candidates = $disk
            ? [$disk]
            : (self::isS3Configured() ? ['s3'] : ['public', 'private']);

        foreach ($candidates as $candidate) {
            if (Storage::disk($candidate)->exists($path)) {
                return Storage::disk($candidate)->delete($path);
            }
        }

        return false;
    }

    /**
     * Get the public URL for a stored file.
     *
     * This method is for *public* assets only (logos, gallery photos, etc.).
     * Private files (verification docs, etc.) must be served via
     * temporaryUrl() so S3 can issue a short-lived signed URL — calling
     * url() with a 'private' disk hint will return null on purpose to
     * prevent accidentally exposing private S3 objects through the public
     * S3 hostname.
     *
     * The $disk argument is used both as a visibility hint and as the
     * local-storage fallback disk name. When omitted it defaults to
     * 'public'.
     *
     * @param  string  $path  The file path
     * @param  string|null  $disk  Optional disk hint ('public' or 'private'); defaults to 'public'
     * @return string|null The file URL or null if not available
     */
    public static function url(string $path, ?string $disk = null): ?string
    {
        if (! $path) {
            return null;
        }

        // Treat any non-'public' hint as a private request. Defaulting to
        // 'public' preserves the long-standing call-site behaviour where
        // most callers don't pass a disk at all.
        $disk = $disk ?: 'public';

        if ($disk !== 'public') {
            // Refuse to mint a public URL for a file the caller flagged as
            // private — even on S3 this would 403, and we don't want to
            // leak the path either.
            return null;
        }

        if (self::isS3Configured()) {
            return Storage::disk('s3')->url($path);
        }

        try {
            if (! Storage::disk($disk)->exists($path)) {
                return null;
            }

            $url = Storage::disk($disk)->url($path);

            if (! $url) {
                return null;
            }

            // Storage::url() may return either an absolute or relative URL
            // depending on the disk's configured 'url'. Force absolute so
            // Inertia/JSON consumers always get a well-formed link.
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                return $url;
            }

            $baseUrl = rtrim(config('app.url'), '/');

            return str_starts_with($url, '/')
                ? $baseUrl.$url
                : $baseUrl.'/'.$url;
        } catch (\Exception $e) {
            Log::warning('Failed to generate file URL', [
                'path' => $path,
                'disk' => $disk,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get a temporary signed URL for a private file.
     *
     * Use this for any file that was uploaded with 'private' visibility (e.g.
     * verification documents). When S3 is configured we hand back a real
     * pre-signed URL that expires after $expirationMinutes; on local storage
     * there's no such concept, so callers should expose a route-based signed
     * URL (Laravel's `URL::temporarySignedRoute(...)`) instead.
     *
     * The $disk argument is kept for backwards compatibility but is now
     * ignored when S3 is configured — every private file lives on S3 in
     * production regardless of caller hints.
     *
     * @param  string  $path  The file path
     * @param  int  $expirationMinutes  Minutes until URL expires (default: 60)
     * @param  string|null  $disk  Deprecated; left for compatibility
     * @return string|null The signed URL or null if not available locally
     */
    public static function temporaryUrl(
        string $path,
        int $expirationMinutes = 60,
        ?string $disk = null
    ): ?string {
        if (! $path) {
            return null;
        }

        try {
            if (self::isS3Configured()) {
                return Storage::disk('s3')->temporaryUrl(
                    $path,
                    now()->addMinutes($expirationMinutes)
                );
            }

            // Local private storage has no driver-level signed URLs; callers
            // should expose a controller route guarded by a temporary signed
            // route to stream the file. We deliberately return null here so
            // they fall back to that path.
            return null;
        } catch (\Exception $e) {
            Log::warning('Failed to generate temporary file URL', [
                'path' => $path,
                'disk' => $disk,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Check if file exists
     *
     * @param  string  $path  The file path
     * @param  string|null  $disk  Optional disk name (auto-detected if null)
     * @return bool True if file exists
     */
    public static function exists(string $path, ?string $disk = null): bool
    {
        if (! $path) {
            return false;
        }

        // Auto-detect disk if not provided
        if (! $disk) {
            $disk = self::isS3Configured() ? 's3' : 'private';
        }

        return Storage::disk($disk)->exists($path);
    }

    /**
     * Check if S3 is properly configured.
     *
     * Reads from config (not env) so this keeps working after
     * `php artisan config:cache`, which is the recommended deploy step in
     * production. Result is memoised per-request so we don't re-resolve
     * config on every call.
     *
     * @return bool True if S3 credentials are configured
     */
    public static function isS3Configured(): bool
    {
        static $configured = null;

        if ($configured === null) {
            $configured = ! empty(config('filesystems.disks.s3.key'))
                && ! empty(config('filesystems.disks.s3.secret'))
                && ! empty(config('filesystems.disks.s3.region'))
                && ! empty(config('filesystems.disks.s3.bucket'));
        }

        return $configured;
    }

    /**
     * Get the appropriate disk for a given visibility
     *
     * @param  string  $visibility  'public' or 'private'
     * @return string The disk name
     */
    public static function getDisk(string $visibility = 'private'): string
    {
        if (self::isS3Configured()) {
            return 's3';
        }

        return $visibility === 'public' ? 'public' : 'private';
    }
}
