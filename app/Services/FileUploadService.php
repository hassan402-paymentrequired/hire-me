<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload a file to the appropriate storage (S3 if configured, otherwise local)
     *
     * @param UploadedFile $file The file to upload
     * @param string $directory The directory path (e.g., 'verifications', 'business-images')
     * @param string $visibility 'public' or 'private'
     * @param string|null $filename Optional custom filename (without extension)
     * @return string The stored file path
     */
    public static function upload(
        UploadedFile $file,
        string $directory,
        string $visibility = 'private',
        ?string $filename = null
    ): string {
        // Check if S3 is configured
        $useS3 = self::isS3Configured();
        
        // Generate filename if not provided
        if (!$filename) {
            $filename = Str::uuid() . '_' . time();
        }
        
        // Get file extension
        $extension = $file->getClientOriginalExtension();
        $fullFilename = $filename . '.' . $extension;
        
        // Determine storage disk
        $disk = $useS3 ? 's3' : ($visibility === 'public' ? 'public' : 'private');
        
        // Store the file
        $path = $file->storeAs($directory, $fullFilename, $disk);
        
        return $path;
    }

    /**
     * Upload multiple files
     *
     * @param array $files Array of UploadedFile instances
     * @param string $directory The directory path
     * @param string $visibility 'public' or 'private'
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
     * Delete a file from storage
     *
     * @param string $path The file path to delete
     * @param string|null $disk Optional disk name (auto-detected if null)
     * @return bool True if deleted, false otherwise
     */
    public static function delete(string $path, ?string $disk = null): bool
    {
        if (!$path) {
            return false;
        }

        // Auto-detect disk if not provided
        if (!$disk) {
            $disk = self::isS3Configured() ? 's3' : 'private';
        }

        // Check if file exists before deleting
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }

    /**
     * Get the URL for a stored file
     *
     * @param string $path The file path
     * @param string|null $disk Optional disk name (auto-detected if null)
     * @return string|null The file URL or null if not found
     */
    public static function url(string $path, ?string $disk = null): ?string
    {
        if (!$path) {
            return null;
        }

        // Auto-detect disk if not provided
        if (!$disk) {
            $disk = self::isS3Configured() ? 's3' : 'public';
        }

        // For private files on local storage, we might need a different approach
        // For now, we'll try to get the URL anyway (might work if file is accessible)
        // In production with S3, this will work correctly

        try {
            return Storage::disk($disk)->url($path);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get a temporary signed URL for private files (useful for S3)
     *
     * @param string $path The file path
     * @param int $expirationMinutes Minutes until URL expires (default: 60)
     * @param string|null $disk Optional disk name (auto-detected if null)
     * @return string|null The signed URL or null if not available
     */
    public static function temporaryUrl(
        string $path,
        int $expirationMinutes = 60,
        ?string $disk = null
    ): ?string {
        if (!$path) {
            return null;
        }

        // Auto-detect disk if not provided
        if (!$disk) {
            $disk = self::isS3Configured() ? 's3' : 'private';
        }

        try {
            // Only S3 and some other cloud storage support temporary URLs
            if ($disk === 's3' || $disk === 's3') {
                return Storage::disk($disk)->temporaryUrl(
                    $path,
                    now()->addMinutes($expirationMinutes)
                );
            }

            // For local private storage, return null or create a route-based signed URL
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Check if file exists
     *
     * @param string $path The file path
     * @param string|null $disk Optional disk name (auto-detected if null)
     * @return bool True if file exists
     */
    public static function exists(string $path, ?string $disk = null): bool
    {
        if (!$path) {
            return false;
        }

        // Auto-detect disk if not provided
        if (!$disk) {
            $disk = self::isS3Configured() ? 's3' : 'private';
        }

        return Storage::disk($disk)->exists($path);
    }

    /**
     * Check if S3 is properly configured
     *
     * @return bool True if S3 credentials are configured
     */
    public static function isS3Configured(): bool
    {
        return !empty(env('AWS_ACCESS_KEY_ID')) &&
               !empty(env('AWS_SECRET_ACCESS_KEY')) &&
               !empty(env('AWS_DEFAULT_REGION')) &&
               !empty(env('AWS_BUCKET'));
    }

    /**
     * Get the appropriate disk for a given visibility
     *
     * @param string $visibility 'public' or 'private'
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
