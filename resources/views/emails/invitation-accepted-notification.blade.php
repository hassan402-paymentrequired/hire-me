<x-mail::message>
# Invitation Accepted

Hello,

**{{ $teamMember->user->name }}** has accepted your invitation to join **{{ $businessName }}** as a **{{ ucfirst($teamMember->role) }}** team member.

<x-mail::button :url="url('/business/team')">
View Team Members
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
