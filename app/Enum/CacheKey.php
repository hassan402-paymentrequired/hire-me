<?php

namespace App\Enum;

enum CacheKey: string
{
    case CATEGORY = "category";

    case PROVIDERS = "providers";

    case MARKETPLACE = "marketplace";

    case PROVIDER_MARKETPLACE = "marketplace.providers";

    case MARKETPLACE_CATEGORIES = "marketplace.categories";
}
