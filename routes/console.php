<?php

use App\Jobs\AutoCancelUnconfirmedAppointmentJob;
use App\Jobs\GenerateRecurringAppointments;
use App\Jobs\Provider\AppointmentApproveDelayedJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


//Schedule::job(new AppointmentApproveDelayedJob())->everyThirtyMinutes();
Schedule::job(new AppointmentApproveDelayedJob())->everyTwentySeconds();

// Generate recurring appointments daily
Schedule::job(new GenerateRecurringAppointments())->daily();

// Auto-cancel pending appointments when provider doesn't confirm within 1 hour of start
Schedule::job(new AutoCancelUnconfirmedAppointmentJob())->everyTwentySeconds();
