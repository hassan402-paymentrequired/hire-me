<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Platform Fees
    |--------------------------------------------------------------------------
    |
    | Keep fee logic configurable so we can change it without code deployments.
    | Percent values are stored as whole percentages (e.g. 10 = 10%).
    |
    */

    'booking_fee_percent' => (float) env('PLATFORM_BOOKING_FEE_PERCENT', 10),
];

