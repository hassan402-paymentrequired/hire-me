<?php

namespace App\Services;

class ProviderLogService
{
    public static function log($userId, $action, $description = null, $metadata = null)
    {
        \App\Models\ProviderLog::create([
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'metadata' => $metadata ??= null,
        ]);
    }

    public static function getLogsForProvider($userId, $perPage = 20)
    {
        return \App\Models\ProviderLog::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public static function getRecentLog($userId, $total = 5)
    {
        return \App\Models\ProviderLog::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($total)->get();
    }
}
