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
        'subject' => env('VAPID_SUBJECT', 'mailto:your-email@example.com'),
        'public_key' => env('VAPID_PUBLIC_KEY'),
        'private_key' => env('VAPID_PRIVATE_KEY'),
        'pem_file' => env('VAPID_PEM_FILE'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Push Subscription Model
    |--------------------------------------------------------------------------
    | The Eloquent model used by the package to store push subscriptions.
    */
    'model' => \NotificationChannels\WebPush\PushSubscription::class,

    /*
    |--------------------------------------------------------------------------
    | Push Subscriptions Table
    |--------------------------------------------------------------------------
    */
    'table_name' => env('WEBPUSH_DB_TABLE', 'push_subscriptions'),

    /*
    |--------------------------------------------------------------------------
    | Database Connection
    |--------------------------------------------------------------------------
    */
    'database_connection' => env('WEBPUSH_DB_CONNECTION', env('DB_CONNECTION', 'mysql')),

    /*
    |--------------------------------------------------------------------------
    | Guzzle Client Options
    |--------------------------------------------------------------------------
    */
    'client_options' => [],

    /*
    |--------------------------------------------------------------------------
    | Automatic Padding
    |--------------------------------------------------------------------------
    | Set to false to support Firefox Android with v1 endpoint.
    */
    'automatic_padding' => env('WEBPUSH_AUTOMATIC_PADDING', true),
];
