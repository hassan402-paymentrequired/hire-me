<?php

return [
    'defaults' => [
        'bufferTime' => '0',
        'advanceBooking' => '30',
        'minNotice' => null,
        'maxDaily' => null,
        'allowSameDay' => false,
        'autoConfirm' => false,
        'allowOffHoursRequests' => false,
        'max_bookings_per_week' => null,
        'max_bookings_per_month' => null,
        'auto_release_payment' => false,
        'accept_online_payment' => true,
        'accept_offline_booking' => false,
        'offers_home_service' => false,
        'service_delivery_mode' => 'client_visits_provider',
        'billing_model' => 'commission',
    ],
];
