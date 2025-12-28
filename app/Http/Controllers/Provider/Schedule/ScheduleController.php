<?php

namespace App\Http\Controllers\Provider\Schedule;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function calender()
    {
        return Inertia::render('provider/schedule/calendar');
    }

    public function appointments()
    {
        return Inertia::render('provider/schedule/appointments');
    }
}
