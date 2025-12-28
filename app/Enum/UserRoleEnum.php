<?php

namespace App\Enum;

enum UserRoleEnum: string
{
    case CLIENT = 'client';
    case PROVIDER = 'provider';
}
