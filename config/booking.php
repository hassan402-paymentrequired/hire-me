<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Recurring booking discount
    |--------------------------------------------------------------------------
    |
    | Percentage applied to each booking in a recurring series. Stored as a
    | whole percentage (e.g. 10 = 10%). Read by both the FE (via Inertia
    | props) and the BE (when persisting recurring appointments) so the two
    | sides cannot drift.
    |
    */

    'recurring_discount_percent' => (float) env('RECURRING_DISCOUNT_PERCENT', 10),
];
