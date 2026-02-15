<?php

use Illuminate\Support\Str;

function auth_user(string $guard = 'web')
{
    return auth($guard)->user();
}

function is_admin(string $guard = 'admin')
{
    return auth($guard)->user()->role === \App\Enum\UserRoleEnum::ADMIN || auth($guard)->user()->role === \App\Enum\UserRoleEnum::SUPER_ADMIN;
}

function is_moderator(string $guard = 'admin')
{
    return auth($guard)->user()->role === \App\Enum\UserRoleEnum::MODERATOR || auth($guard)->user()->role === \App\Enum\UserRoleEnum::SUPER_MODERATOR;
}

function generate_random(int $length = 12): string
{
    return Str::random($length);
}
