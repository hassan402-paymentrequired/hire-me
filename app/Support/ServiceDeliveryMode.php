<?php

namespace App\Support;

class ServiceDeliveryMode
{
    public const CLIENT_VISITS_PROVIDER = 'client_visits_provider';

    public const PROVIDER_VISITS_CLIENT = 'provider_visits_client';

    public const BOTH = 'both';

    public static function allowed(): array
    {
        return [
            self::CLIENT_VISITS_PROVIDER,
            self::PROVIDER_VISITS_CLIENT,
            self::BOTH,
        ];
    }

    public static function resolve(?array $settings): string
    {
        $settings = ProviderSettings::resolve($settings ?? []);
        $mode = $settings['service_delivery_mode'] ?? null;

        if (in_array($mode, self::allowed(), true)) {
            return $mode;
        }

        return filter_var($settings['offers_home_service'] ?? false, FILTER_VALIDATE_BOOLEAN)
            ? self::PROVIDER_VISITS_CLIENT
            : self::CLIENT_VISITS_PROVIDER;
    }

    public static function requiresClientServiceAddress(string $mode): bool
    {
        return $mode === self::PROVIDER_VISITS_CLIENT;
    }

    public static function allowsVisitProvider(string $mode): bool
    {
        return in_array($mode, [self::CLIENT_VISITS_PROVIDER, self::BOTH], true);
    }

    public static function allowsHomeService(string $mode): bool
    {
        return in_array($mode, [self::PROVIDER_VISITS_CLIENT, self::BOTH], true);
    }

    public static function sync(array $settings): array
    {
        $mode = $settings['service_delivery_mode'] ?? null;

        if (! in_array($mode, self::allowed(), true)) {
            $mode = filter_var($settings['offers_home_service'] ?? false, FILTER_VALIDATE_BOOLEAN)
                ? self::PROVIDER_VISITS_CLIENT
                : self::CLIENT_VISITS_PROVIDER;
        }

        $settings['service_delivery_mode'] = $mode;
        $settings['offers_home_service'] = self::allowsHomeService($mode);

        return $settings;
    }

    public static function bookingCtaLabel(string $mode): string
    {
        return match ($mode) {
            self::PROVIDER_VISITS_CLIENT => 'Book a visit',
            self::BOTH => 'Book now',
            default => 'Book appointment',
        };
    }

    public static function clientLocationLabel(string $mode): string
    {
        return match ($mode) {
            self::PROVIDER_VISITS_CLIENT => 'We come to you',
            self::CLIENT_VISITS_PROVIDER => 'Visit us',
            self::BOTH => 'At your location or ours',
        };
    }
}
