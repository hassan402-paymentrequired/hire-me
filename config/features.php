<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Feature flags (v1 vs v2 surfaces)
    |--------------------------------------------------------------------------
    |
    | Job board and provider widget are implemented but intentionally disabled
    | for v1 to keep the launch focused on marketplace appointment booking.
    |
    */

    'job_board' => (bool) env('FEATURE_JOB_BOARD', false),

    'provider_widget' => (bool) env('FEATURE_PROVIDER_WIDGET', false),
];
