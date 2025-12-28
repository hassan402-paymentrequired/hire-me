<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Laravel\Fortify\Features;


class GuestController extends Controller
{
    public function welcome()
    {
          return Inertia::render('guest/welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
    }
}
