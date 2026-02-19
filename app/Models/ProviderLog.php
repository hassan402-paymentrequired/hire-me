<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class ProviderLog extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'metadata',
    ];
}
