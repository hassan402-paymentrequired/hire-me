<?php

namespace App\Enum;

enum UserRoleEnum: string
{
    case CLIENT = 'client';
    case PROVIDER = 'provider';
    case ADMIN = 'admin';
    case MODERATOR = 'moderator';
    case SUPER_ADMIN = 'super_admin';
    case SUPER_MODERATOR = 'super_moderator';
}
