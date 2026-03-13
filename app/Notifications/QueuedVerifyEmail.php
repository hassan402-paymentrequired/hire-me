<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Queued email verification notification.
 *
 * Uses the VerifyEmail notification logic (including the AppServiceProvider
 * VerifyEmail::toMailUsing override), but sends via the queue.
 */
class QueuedVerifyEmail extends VerifyEmail implements ShouldQueue
{
    use Queueable;
}

