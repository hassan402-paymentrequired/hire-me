<?php

namespace App\Services\Ai;

use RuntimeException;

/**
 * Every configured NVIDIA model failed or is cooling down, so no reply could be produced.
 */
class AiUnavailable extends RuntimeException {}
