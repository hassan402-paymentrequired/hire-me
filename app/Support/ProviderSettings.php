<?php

namespace App\Support;

use App\Models\BusinessProfile;

class ProviderSettings
{
    public static function defaults(): array
    {
        return config('provider_settings.defaults', []);
    }

    public static function resolve(?array $settings): array
    {
        return self::sanitize(array_merge(self::defaults(), $settings ?? []));
    }

    public static function sanitize(?array $settings): array
    {
        $settings = array_merge(self::defaults(), $settings ?? []);

        foreach ([
            'allowSameDay',
            'autoConfirm',
            'allowOffHoursRequests',
            'auto_release_payment',
            'accept_online_payment',
            'accept_offline_booking',
        ] as $key) {
            $settings[$key] = filter_var($settings[$key] ?? false, FILTER_VALIDATE_BOOLEAN);
        }

        foreach ([
            'minNotice',
            'maxDaily',
            'max_bookings_per_week',
            'max_bookings_per_month',
        ] as $key) {
            $value = $settings[$key] ?? null;
            $settings[$key] = ($value === '' || $value === null) ? null : (string) $value;
        }

        $settings['bufferTime'] = (string) ($settings['bufferTime'] ?? '0');
        $settings['advanceBooking'] = (string) ($settings['advanceBooking'] ?? '30');

        if (! $settings['accept_online_payment'] && ! $settings['accept_offline_booking']) {
            $settings['accept_online_payment'] = true;
        }

        return $settings;
    }

    public static function ensurePersisted(BusinessProfile $profile): void
    {
        $resolved = self::resolve($profile->settings);

        if (($profile->settings ?? []) !== $resolved) {
            $profile->forceFill(['settings' => $resolved])->saveQuietly();
        }
    }
}
