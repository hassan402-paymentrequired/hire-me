<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;

class ProviderController extends Controller
{

    public function dashboard() {
        return Inertia::render('provider/dashboard/index');
    }

}
