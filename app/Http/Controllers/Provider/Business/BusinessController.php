<?php

namespace App\Http\Controllers\Provider\Business;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BusinessController extends Controller
{
    public function businessHours()
    {
        return Inertia::render('provider/business/hours');
    }

    public function analytics()
    {
        return Inertia::render('provider/business/analytics');
    }
}
