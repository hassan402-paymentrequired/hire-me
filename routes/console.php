<?php

use App\Jobs\AutoCancelUnconfirmedAppointmentJob;
use App\Jobs\CreditCompletedAppointmentDeplay;
use App\Jobs\GenerateRecurringAppointments;
use App\Jobs\Provider\AppointmentApproveDelayedJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::job(new AppointmentApproveDelayedJob())->everyTwentySeconds();

Schedule::job(new GenerateRecurringAppointments())->daily();

Schedule::job(new AutoCancelUnconfirmedAppointmentJob())->everyTwentySeconds();


Schedule::command('app:release-funds-for-completed-appointments')->everyFifteenMinutes();
