<?php

namespace App\Console\Commands\Provider;

use App\Jobs\Provider\AppointmentApproveDelayedJob;
use Illuminate\Console\Command;

class AppointmentApprovedDelayCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:appointment-approved-delay-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to handle delayed actions after appointment approval';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        AppointmentApproveDelayedJob::dispatch();
    }
}
