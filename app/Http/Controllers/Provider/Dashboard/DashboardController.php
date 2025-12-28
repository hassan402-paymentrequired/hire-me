<?php

namespace App\Http\Controllers\Provider\Dashboard;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{

    public function dashboard() {
        return Inertia::render('provider/dashboard/index');
    }

}
