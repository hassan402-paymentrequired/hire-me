<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VAPID keys (required for Web Push)
    |--------------------------------------------------------------------------
    | Run: php artisan webpush:vapid
    | That will set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env
    */
    'vapid' => [
       'subject' => env('VAPID_SUBJECT', 'mailto:your-email@example.com'), // ← THIS IS MISSING
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Cloud Messaging (optional, legacy)
    |--------------------------------------------------------------------------
    */
    'gcm' => [
        'key' => env('GCM_KEY'),
        'sender_id' => env('GCM_SENDER_ID'),
    ],
];
