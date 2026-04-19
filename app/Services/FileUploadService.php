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
        
        // Generate filename if not providedx
        if (!$filename) {
            $filename = Str::uuid() . '_' . time();
        }
        
        // Get file extension
        $extension = $file->getClientOriginalExtension();
        $fullFilename = $filename . '.' . $extension;
        
        // Determine storage disk
        $disk = $useS3 ? 's3' : ($visibility === 'public' ? 'public' : 'private');
        
        // Store the file
        $path = $file->storeAs($directory, $fullFilename,['visibility' => $visibility, 'disk' => $disk]);
        
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

        try {
            // For S3, use the url() method which returns the full S3 URL
            if ($disk === 's3') {
                $url = Storage::disk($disk)->url($path);
                return $url;
            }

            // For local public storage, use Storage::url() which handles the storage link
            if ($disk === 'public') {
                // Check if file exists first
                if (!Storage::disk($disk)->exists($path)) {
                    \Log::warning('File not found in public storage', [
                        'path' => $path, 
                        'disk' => $disk,
                        'full_path' => Storage::disk($disk)->path($path)
                    ]);
                    return null;
                }
                
                // Generate URL using Storage::url()
                // According to filesystems.php config: 'url' => env('APP_URL').'/storage'
                // Storage::url() should return: APP_URL/storage/path/to/file
                $url = Storage::disk($disk)->url($path);
                
                // Laravel's Storage::url() uses the 'url' config which should already include APP_URL
                // But let's ensure it's absolute (some Laravel versions return relative)
                if ($url) {
                    // If already absolute URL, return as is
                    if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                        return $url;
                    }
                    
                    // If relative (starts with /), prepend APP_URL
                    if (str_starts_with($url, '/')) {
                        $baseUrl = rtrim(config('app.url'), '/');
                        return $baseUrl . $url;
                    }
                    
                    // Otherwise prepend APP_URL with /
                    $baseUrl = rtrim(config('app.url'), '/');
                    return $baseUrl . '/' . $url;
                }
                
                return null;
            }

            // For private storage, we can't generate a public URL
            // Return null - caller should use a secure route instead
            return null;
        } catch (\Exception $e) {
            \Log::warning('Failed to generate file URL', [
                'path' => $path,
                'disk' => $disk,
                'error' => $e->getMessage()
            ]);
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
