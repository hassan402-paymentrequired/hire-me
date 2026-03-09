<?php

namespace App\Services;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;

class ProviderTeamInvitationService
{
    public function invitationContext(?string $token): ?array
    {
        $provider = $this->resolveProviderFromToken($token);

        if (! $provider) {
            return null;
        }

        return [
            'provider' => $provider,
            'businessName' => $provider->businessProfile?->business_name ?? $provider->name,
        ];
    }

    public function resolveProviderFromToken(?string $token): ?User
    {
        if (! $token) {
            return null;
        }

        try {
            $payload = json_decode(Crypt::decryptString($token), true, flags: JSON_THROW_ON_ERROR);
        } catch (\Throwable $e) {
            return null;
        }

        $providerId = $payload['provider_id'] ?? null;
        $providerInvitationLink = $payload['invitation_link'] ?? null;

        if (! $providerId || ! $providerInvitationLink) {
            return null;
        }

        return User::query()
            ->whereKey($providerId)
            ->where('invitation_link', $providerInvitationLink)
            ->whereHas('businessProfile')
            ->first();
    }

    public function attachUserFromToken(User $user, ?string $token): array
    {
        $provider = $this->resolveProviderFromToken($token);

        if (! $provider) {
            return [
                'status' => 'error',
                'message' => 'This team invitation link is invalid or no longer available.',
            ];
        }

        if ($user->id === $provider->id) {
            return [
                'status' => 'error',
                'message' => 'You cannot join your own team through the staff invitation link.',
            ];
        }

        if ($user->hasProviderSetup()) {
            return [
                'status' => 'error',
                'message' => 'Provider accounts cannot join a team through a staff invitation link.',
            ];
        }

        $teamMember = TeamMember::query()
            ->where('provider_id', $provider->id)
            ->where('user_id', $user->id)
            ->first();

        if ($teamMember && $teamMember->accepted_at) {
            return [
                'status' => 'success',
                'message' => 'You are already a member of this provider team.',
            ];
        }

        if ($teamMember) {
            $teamMember->update([
                'role' => 'staff',
                'is_active' => true,
                'invited_by' => $provider->id,
                'invited_at' => $teamMember->invited_at ?? now(),
                'accepted_at' => now(),
                'invitation_link' => null,
                'invitation_expires_at' => null,
            ]);
        } else {
            TeamMember::create([
                'provider_id' => $provider->id,
                'user_id' => $user->id,
                'role' => 'staff',
                'is_active' => true,
                'invited_by' => $provider->id,
                'invited_at' => now(),
                'accepted_at' => now(),
            ]);
        }

        return [
            'status' => 'success',
            'message' => 'You joined the provider team successfully as staff.',
        ];
    }
}
