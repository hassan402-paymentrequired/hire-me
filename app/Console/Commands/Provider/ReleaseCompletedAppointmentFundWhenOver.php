<?php

namespace App\Console\Commands\Provider;

use App\Jobs\CreditCompletedAppointmentDeplay;
use Illuminate\Console\Command;

class ReleaseCompletedAppointmentFundWhenOver extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:release-funds-for-completed-appointments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Release funds for completed appointments that are past the release time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        CreditCompletedAppointmentDeplay::dispatch();
    }
}
