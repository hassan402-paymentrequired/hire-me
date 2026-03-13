<?php

namespace App\Services;

use App\Models\EmailVerificationOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmailVerificationOtpService
{
    public const CODE_LENGTH = 6;
    public const EXPIRY_MINUTES = 10;
    public const MAX_ATTEMPTS = 5;
    public const RESEND_COOLDOWN_SECONDS = 60;

    /**
     * Issue (create/rotate) an OTP for a user and return the plain code.
     */
    public function issue(User $user, bool $enforceCooldown = false): string
    {
        $now = now();

        $record = EmailVerificationOtp::firstOrNew(['user_id' => $user->id]);

        if (
            $enforceCooldown &&
            $record->exists &&
            $record->last_sent_at &&
            $record->last_sent_at->diffInSeconds($now) < self::RESEND_COOLDOWN_SECONDS
        ) {
            throw ValidationException::withMessages([
                'code' => 'Please wait a moment before requesting another code.',
            ]);
        }

        $code = (string) random_int(10 ** (self::CODE_LENGTH - 1), (10 ** self::CODE_LENGTH) - 1);

        $record->code_hash = Hash::make($code);
        $record->expires_at = $now->copy()->addMinutes(self::EXPIRY_MINUTES);
        $record->attempts = 0;
        $record->sent_count = ($record->sent_count ?? 0) + 1;
        $record->last_sent_at = $now;
        $record->save();

        return $code;
    }

    /**
     * Verify a code for the user. On success, the OTP record is deleted.
     */
    public function verifyOrFail(User $user, string $code): void
    {
        $record = EmailVerificationOtp::where('user_id', $user->id)->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'code' => 'No verification code found. Please request a new code.',
            ]);
        }

        if ($record->expires_at && $record->expires_at->isPast()) {
            $record->delete();
            throw ValidationException::withMessages([
                'code' => 'That code has expired. Please request a new code.',
            ]);
        }

        if (($record->attempts ?? 0) >= self::MAX_ATTEMPTS) {
            throw ValidationException::withMessages([
                'code' => 'Too many incorrect attempts. Please request a new code.',
            ]);
        }

        if (! Hash::check($code, $record->code_hash)) {
            $record->attempts = ($record->attempts ?? 0) + 1;
            $record->save();
            throw ValidationException::withMessages([
                'code' => 'Invalid verification code.',
            ]);
        }

        $record->delete();
    }
}
