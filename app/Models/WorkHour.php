<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkHour extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'provider_id',
        'day_of_week',
        'start_time',
        'end_time',
        'breaks',
        'is_closed',
    ];

    protected $casts = [
        'breaks' => 'array',
    ];

    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /**
     * Build the weekly schedule (Monday → Sunday) for a provider, or null when none is set.
     *
     * @return array<string, array{isOpen: bool, shifts: array<int, array{start: string, end: string, breaks: array<int, mixed>}>}>|null
     */
    public static function weeklyScheduleFor(int|string|null $providerId): ?array
    {
        $workHours = static::where('provider_id', $providerId)->get();

        if ($workHours->isEmpty()) {
            return null;
        }

        $schedule = [];

        foreach (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as $day) {
            $dayRecords = $workHours->where('day_of_week', $day);

            if ($dayRecords->isEmpty() || $dayRecords->first()->is_closed) {
                $schedule[$day] = ['isOpen' => false, 'shifts' => []];

                continue;
            }

            $schedule[$day] = [
                'isOpen' => true,
                'shifts' => $dayRecords->map(fn (WorkHour $record): array => [
                    'start' => $record->start_time ? Carbon::parse($record->start_time)->format('H:i') : '09:00',
                    'end' => $record->end_time ? Carbon::parse($record->end_time)->format('H:i') : '17:00',
                    'breaks' => $record->breaks ?? [],
                ])->values()->toArray(),
            ];
        }

        return $schedule;
    }
}
