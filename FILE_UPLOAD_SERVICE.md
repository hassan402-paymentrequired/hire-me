# File Upload Service Documentation

## Overview
The `FileUploadService` is a reusable service that handles file uploads across the application. It automatically detects if AWS S3 is configured and uses it for production, otherwise falls back to local filesystem storage.

## Features
- ✅ Automatic S3 detection and configuration
- ✅ Seamless fallback to local filesystem
- ✅ Support for public and private file storage
- ✅ File deletion with proper disk detection
- ✅ URL generation for stored files
- ✅ Temporary signed URLs for private files (S3)
- ✅ Multiple file upload support

## Configuration

### Local Development (Filesystem)
No additional configuration needed. Files are stored in:
- Public files: `storage/app/public/`
- Private files: `storage/app/private/`

### Production (S3)
Set the following environment variables in your `.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=your_region
AWS_BUCKET=your_bucket_name
AWS_URL=your_s3_url  # Optional
AWS_ENDPOINT=your_endpoint  # Optional
AWS_USE_PATH_STYLE_ENDPOINT=false  # Optional
```

The service automatically detects if S3 is configured by checking if all required credentials are present.

## Usage

### Upload a Single File

```php
use App\Services\FileUploadService;

// Upload a public file (e.g., business images)
$path = FileUploadService::upload(
    $request->file('image'),
    'business-images',  // Directory
    'public'            // Visibility
);

// Upload a private file (e.g., verification documents)
$path = FileUploadService::upload(
    $request->file('document'),
    'verifications',
    'private'
);

// Upload with custom filename
$path = FileUploadService::upload(
    $request->file('logo'),
    'business-logos',
    'public',
    'my-custom-filename'  // Without extension
);
```

### Upload Multiple Files

```php
$paths = FileUploadService::uploadMultiple(
    $request->file('images'),  // Array of files
    'business-images',
    'public'
);
```

### Delete a File

```php
// Auto-detect disk
FileUploadService::delete($filePath);

// Specify disk explicitly
FileUploadService::delete($filePath, 'public');
```

### Get File URL

```php
// Get public URL
$url = FileUploadService::url($filePath, 'public');

// Auto-detect disk (uses 'public' for public files, 's3' for S3)
$url = FileUploadService::url($filePath);
```

### Get Temporary Signed URL (S3 only)

```php
// Get a temporary URL that expires in 60 minutes (default)
$url = FileUploadService::temporaryUrl($filePath, 60);

// Custom expiration time
$url = FileUploadService::temporaryUrl($filePath, 120); // 2 hours
```

### Check if File Exists

```php
$exists = FileUploadService::exists($filePath);
```

### Check S3 Configuration

```php
$isS3Configured = FileUploadService::isS3Configured();
```

### Get Appropriate Disk

```php
$disk = FileUploadService::getDisk('public');  // Returns 's3' or 'public'
$disk = FileUploadService::getDisk('private'); // Returns 's3' or 'private'
```

## Implementation Examples

### Business Profile Image Upload
```php
// In OnboardingController
$path = FileUploadService::upload(
    $image,
    'business-images',
    'public'
);
```

### Verification Document Upload
```php
// In OnboardingController
$path = FileUploadService::upload(
    $request->file('document'),
    'verifications',
    'private'
);
```

### Image Deletion
```php
// In BusinessController
FileUploadService::delete($oldLogo->image_path, 'public');
```

### URL Generation for Display
```php
// In BusinessController
'images' => $profile->images->map(fn($img) => [
    'id' => $img->id,
    'path' => FileUploadService::url($img->image_path, 'public'),
    'is_logo' => $img->is_logo,
]),
```

## Updated Controllers

The following controllers have been updated to use `FileUploadService`:

1. **OnboardingController**
   - Business profile image uploads
   - Verification document uploads

2. **BusinessController**
   - Business logo uploads
   - Business image uploads
   - Image deletion
   - Image URL generation

3. **GuestController**
   - Logo URL generation

4. **MarketplaceController**
   - Image URL generation

## Migration Notes

### From Direct Storage Calls
**Before:**
```php
$path = $request->file('image')->store('business-images', 'public');
Storage::disk('public')->delete($oldPath);
$url = Storage::url($path);
```

**After:**
```php
$path = FileUploadService::upload($request->file('image'), 'business-images', 'public');
FileUploadService::delete($oldPath, 'public');
$url = FileUploadService::url($path, 'public');
```

## Benefits

1. **Consistency**: All file operations go through one service
2. **Flexibility**: Easy to switch between local and S3 storage
3. **Maintainability**: Changes to storage logic only need to be made in one place
4. **Type Safety**: Clear method signatures and return types
5. **Error Handling**: Built-in error handling for file operations

## Future Enhancements

- [ ] Support for other cloud storage providers (Google Cloud, Azure)
- [ ] Image optimization/resizing on upload
- [ ] File validation helpers
- [ ] Batch operations with progress tracking
- [ ] CDN URL generation for S3 files
