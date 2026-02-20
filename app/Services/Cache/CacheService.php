<?php

namespace App\Services\Cache;

use App\Enum\CacheKey;
use Illuminate\Support\Facades\Cache;


class CacheService
{
    public static function clearMarketplaceCache(): void
    {
        Cache::tags([CacheKey::PROVIDERS->value, CacheKey::MARKETPLACE->value])->flush();
    }

      public static function clearCategoriesCache(): void
    {
        Cache::tags(['categories'])->flush();
    }
}
