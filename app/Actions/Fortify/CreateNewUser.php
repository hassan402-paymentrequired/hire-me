<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Enum\UserRoleEnum;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use App\Services\ProviderTeamInvitationService;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function __construct(
        private ProviderTeamInvitationService $providerTeamInvitationService,
    ) {
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'invitation_token' => ['nullable', 'string'],
        ])->validate();

        $provider = $this->providerTeamInvitationService->resolveProviderFromToken($input['invitation_token'] ?? null);

        if (($input['invitation_token'] ?? null) && ! $provider) {
            throw ValidationException::withMessages([
                'email' => 'This invitation link is invalid or no longer available.',
            ]);
        }

        return DB::transaction(function () use ($input, $provider) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'role' => $provider ? UserRoleEnum::PROVIDER->value : UserRoleEnum::CLIENT->value,
                'is_verified' => $provider ? true : false, // Auto-verify if joining as provider team member,
            ]);

            if ($provider) {
                $this->providerTeamInvitationService->attachUserFromToken(
                    $user,
                    $input['invitation_token'] ?? null,
                );
            }

            // OTP verification email should be sent immediately after successful registration.
            DB::afterCommit(fn () => $user->sendEmailVerificationNotification());

            return $user;
        });
    }
}
