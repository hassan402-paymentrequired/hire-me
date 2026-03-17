<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\WorkHour;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SaveWorkHourJob
{
    use Dispatchable, Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public array $validated, public User $user)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        DB::transaction(function () {
            WorkHour::where('provider_id', $this->user->id)->delete();

            foreach ($this->validated as $day => $dayData) {
                $firstShift = $dayData['shifts'][0] ?? null;

                WorkHour::create([
                    'provider_id' => $this->user->id,
                    'day_of_week' => $day,
                    'start_time' => ! $dayData['isOpen'] || ! $firstShift ? null : $firstShift['start'] . ':00',
                    'end_time' => ! $dayData['isOpen'] || ! $firstShift ? null : $firstShift['end'] . ':00',
                    'breaks' => ! $dayData['isOpen'] || ! $firstShift ? null : array_map(function ($break) {
                        return [
                            'start' => $break['start'],
                            'end' => $break['end'],
                        ];
                    }, $firstShift['breaks'] ?? []),
                    'is_closed' => ! $dayData['isOpen'],
                ]);
            }
        });
    }
}
