<?php

namespace App\Services\Ai;

use RuntimeException;
use Throwable;

/**
 * One model could not answer; the client moves on to the next one.
 */
class ModelFailed extends RuntimeException
{
    public function __construct(string $message, public int $cooldownSeconds, ?Throwable $previous = null)
    {
        parent::__construct($message, previous: $previous);
    }
}
