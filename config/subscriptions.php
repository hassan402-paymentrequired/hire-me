<?php

return [
    'enabled' => (bool) env('SUBSCRIPTIONS_FEATURE_ENABLED', true),
    'reminder_days_before_end' => (int) env('SUBSCRIPTIONS_REMINDER_DAYS_BEFORE_END', 3),
];
