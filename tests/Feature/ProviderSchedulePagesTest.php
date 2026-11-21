<?php

use App\Models\Appointment;
use App\Models\BusinessProfile;
use App\Models\User;
use App\Models\WorkHour;
use Inertia\Testing\AssertableInertia as Assert;

function providerWithHours(): User
{
    $provider = User::factory()->create(['role' => 'provider']);
    BusinessProfile::factory()->create([
        'user_id' => $provider->id,
        'address' => '1 Main St',
        'has_onboarded' => true,
        'settings' => ['holidays' => [['name' => 'Christmas Day', 'date' => '2026-12-25', 'type' => 'closed']]],
    ]);

    WorkHour::create([
        'provider_id' => $provider->id,
        'day_of_week' => 'Monday',
        'start_time' => '09:00',
        'end_time' => '18:00',
        'breaks' => [['start' => '13:00', 'end' => '14:00']],
        'is_closed' => false,
    ]);

    WorkHour::create([
        'provider_id' => $provider->id,
        'day_of_week' => 'Sunday',
        'is_closed' => true,
    ]);

    return $provider;
}

test('weekly schedule is built monday to sunday with closed days', function () {
    $provider = providerWithHours();

    $schedule = WorkHour::weeklyScheduleFor($provider->id);

    expect(array_keys($schedule))->toBe(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        ->and($schedule['Monday']['isOpen'])->toBeTrue()
        ->and($schedule['Monday']['shifts'][0]['start'])->toBe('09:00')
        ->and($schedule['Tuesday']['isOpen'])->toBeFalse()
        ->and($schedule['Sunday']['isOpen'])->toBeFalse();
});

test('the calendar shares business hours, holidays and booked days', function () {
    $provider = providerWithHours();
    $client = User::factory()->create();
    $weekStart = now()->startOfWeek();

    Appointment::factory()->create([
        'provider_id' => $provider->id,
        'client_id' => $client->id,
        'status' => 'confirmed',
        'start_time' => $weekStart->copy()->setTime(10, 0),
        'end_time' => $weekStart->copy()->setTime(11, 0),
    ]);

    $this->actingAs($provider)
        ->get(route('schedule.calender.index', ['start_date' => $weekStart->toDateString()]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/schedule/calendar')
            ->where('businessHours.Monday.isOpen', true)
            ->where('holidays.0.name', 'Christmas Day')
            ->where('bookedDays', [$weekStart->toDateString()])
        );
});

test('the business hours page shares the weekly schedule', function () {
    $provider = providerWithHours();

    $this->actingAs($provider)
        ->get(route('business.hours'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('provider/business/hours/index')
            ->where('initialSchedule.Monday.shifts.0.end', '18:00')
            ->where('initialSchedule.Sunday.isOpen', false)
        );
});
