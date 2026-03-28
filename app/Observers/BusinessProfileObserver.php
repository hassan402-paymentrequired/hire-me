<?php

namespace App\Observers;

use App\Models\BusinessProfile;
use App\Services\Cache\CacheService;
use App\Support\ProviderSettings;

class BusinessProfileObserver
{
    /**
     * Handle the BusinessProfile "created" event.
     */
    public function created(BusinessProfile $businessProfile): void
    {
        CacheService::clearMarketplaceCache();
    }

    /**
     * Handle the BusinessProfile "updated" event.
     */
    public function updated(BusinessProfile $businessProfile): void
    {
         if ($businessProfile->wasChanged('has_onboarded') && $businessProfile->has_onboarded) {
            ProviderSettings::ensurePersisted($businessProfile);
        }

         if ($businessProfile->isDirty([
            'business_name',
            'description',
            'address',
            'city',
            'state',
            'category',
            'latitude',
            'longitude',
        ])) {
            CacheService::clearMarketplaceCache();
        }
    }

    /**
     * Handle the BusinessProfile "deleted" event.
     */
    public function deleted(BusinessProfile $businessProfile): void
    {
        CacheService::clearMarketplaceCache();
    }

    /**
     * Handle the BusinessProfile "restored" event.
     */
    public function restored(BusinessProfile $businessProfile): void
    {
        //
    }

    /**
     * Handle the BusinessProfile "force deleted" event.
     */
    public function forceDeleted(BusinessProfile $businessProfile): void
    {
        //
    }
}
