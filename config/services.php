<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
    ],

    'payengine' => [
        'provider' => env('PAYMENT_PROVIDER', 'paystack'),
        'base_url' => env('PAYENGINE_BASE_URL', 'https://sandbox.bankingcomponent.com/payengine/v1'),
        'api_key' => env('PAYENGINE_API_KEY'),
        'bearer_token' => env('PAYENGINE_BEARER_TOKEN'),
        'webhook_token' => env('PAYENGINE_WEBHOOK_TOKEN'),
        'partner_bank' => env('PAYENGINE_PARTNER_BANK'),
    ],

    // NVIDIA hosted models (build.nvidia.com), OpenAI-style API. Powers the Kiro assistant.
    // NVIDIA_MODELS is a comma-separated list, tried in order; a failing model is skipped for a while.
    'nvidia' => [
        'key' => env('NVIDIA_API_KEY'),
        'base_url' => env('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
        'models' => env('NVIDIA_MODELS', 'meta/llama-3.3-70b-instruct,meta/llama-4-maverick-17b-128e-instruct,nvidia/nemotron-3-ultra-550b-a55b'),
        'timeout' => (int) env('NVIDIA_TIMEOUT', 30),
        // reasoning models think before they answer; this is added to every reply's token limit
        'thinking_tokens' => (int) env('NVIDIA_THINKING_TOKENS', 0),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', 'https://proxideck.com/auth/google/callback'),
    ],

];
