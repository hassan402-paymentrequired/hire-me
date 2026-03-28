# Team Booking Plan

## Goal

Enable providers to manage team members and allow clients to choose which team member they want to book with during the appointment flow.

This should work end to end across:

- provider team management
- appointment creation
- slot availability
- provider schedule views
- marketplace booking UI
- operational safeguards when team members are updated or removed

## Current State

### Already implemented

- `team_members` table exists with provider/user relationship and role metadata
- `appointments.team_member_id` exists and is nullable
- `TeamMember` model exists with provider, user, inviter, and appointments relations
- provider team list and create pages already exist
- `TeamMemberController` already supports:
  - listing team members
  - creating/inviting team members
  - updating role or active state
  - soft-removal/deactivation logic
  - dropdown JSON endpoint for team members

### Current gaps / risks found in existing code

- Team flow is only partially completed; booking does not use team members yet
- `acceptInvite()` in `TeamMemberController` has obvious issues:
  - typo: `$memeber`
  - missing import for `TeamMemberAcceptInvitation`
  - does not set `accepted_at`
  - success message is incorrect
- `create.tsx` is posting invite acceptance to `business.team.invite.accept()`, which is the wrong route for inviting an existing user
- team role/permission model exists conceptually, but permissions are not yet connected to authorization checks
- removing/deactivating a member checks active appointments, but reassignment strategy for future team-based booking is still undefined
- appointment and slot logic currently appears provider-centric, not team-member-centric

## Product Scope

### In scope

- provider can create/invite/manage team members
- provider can activate/deactivate staff
- client can optionally choose a team member during booking
- provider can optionally leave booking as "any available team member" if desired
- selected team member affects available slots
- selected team member is visible in provider schedule and appointment details
- active bookings assigned to a team member are preserved

### Out of scope for first delivery

- separate calendars per team member in UI beyond filtering/visibility needs
- per-team-member custom services unless required later
- commission/pay split logic
- advanced permission matrix beyond admin/staff
- rotating auto-assignment heuristics

## Recommended Product Decisions

These should be treated as baseline assumptions unless changed.

1. Team member selection should be optional in booking.
2. Default behavior should support:
   - specific team member selected
   - no team member selected = provider / any available staff flow
3. Only active, accepted team members should be bookable.
4. A deactivated team member must not appear in new bookings.
5. Existing appointments assigned to a deactivated member should remain readable and manageable.
6. In v1, all team members inherit provider services and business hours unless the product later requires per-member overrides.

## System Design

### Data model

Current schema is enough for v1 booking assignment, but likely needs small additions later.

Required current behavior:

- `appointments.team_member_id`
  - nullable
  - set when client chooses a team member
  - null when appointment is unassigned / provider-level

Potential future additions, not required immediately:

- team member profile fields:
  - display name override
  - avatar
  - specialty/bio
  - visibility in marketplace
- team member work hours / service mapping tables

### Availability model

This is the main design dependency.

V1 recommendation:

- if no team member is selected:
  - use current provider availability logic
- if a team member is selected:
  - use provider business hours as the baseline
  - exclude times where that specific team member already has conflicting appointments

This avoids adding team-member-specific schedules in the first release while still making selection meaningful.

### Booking model

Booking flow should support:

- provider selection
- service selection
- date/time selection
- optional team member selection
- appointment persistence with `team_member_id`

### Provider operations model

Provider team area should support:

- add new member
- invite existing user
- activate/deactivate member
- update role
- see assigned appointment count
- later: filter schedules/appointments by team member

## Implementation Phases

### Phase 1: Stabilize current team management

Objective: make the existing team module reliable before connecting it to booking.

Tasks:

- fix `TeamMemberController` invitation and acceptance flow
- correct route usage in `resources/js/pages/provider/team/create.tsx`
- ensure accepted invitation sets:
  - `accepted_at`
  - `is_active`
  - cleared invitation token/expiry
- validate duplicate invite cases properly
- verify team index filters and actions still work

Deliverable:

- provider can add/invite/manage team members without broken flows

### Phase 2: Expose team members for booking

Objective: allow the marketplace/provider booking flow to fetch valid team members.

Tasks:

- add booking-facing endpoint or page prop for active accepted team members
- return only members that are:
  - `is_active = true`
  - `accepted_at != null`
- define booking payload contract:
  - `team_member_id?: string | null`

Deliverable:

- booking UI can present team member choices

### Phase 3: Update booking UI

Objective: let clients choose who attends to them.

Areas likely affected:

- marketplace booking page/modal
- widget booking flow if widgets should support staff booking
- appointment edit/reschedule flow if rescheduling must preserve or change team member

Tasks:

- add team-member selector to booking UI
- support:
  - `Any available staff`
  - explicit member selection
- show clear label if a team member is chosen
- preserve selected member through confirmation/checkout flow

Deliverable:

- client can choose a team member while booking

### Phase 4: Slot availability integration

Objective: make staff selection affect bookable time slots.

Tasks:

- update slot availability service/controller logic
- when `team_member_id` is present:
  - filter out conflicting appointments for that member
- when absent:
  - use current provider-level availability behavior
- verify buffer-time handling still works

Deliverable:

- selecting a team member changes available slots correctly

### Phase 5: Persist and display assignments

Objective: make assigned team members visible and usable across operations.

Tasks:

- persist `team_member_id` on appointment creation
- include assigned team member in:
  - appointment details
  - provider appointments list
  - schedule/calendar views
  - client booking details where relevant
- optionally add provider-side filtering by team member

Deliverable:

- appointments visibly belong to a staff member where selected

### Phase 6: Operational safeguards

Objective: prevent team management actions from breaking future bookings.

Tasks:

- define behavior for deactivated members with future appointments
- prevent deletion if reassignment is required
- optionally add reassignment workflow:
  - move future appointments to another team member
  - or clear `team_member_id`
- ensure unavailable/deactivated members are excluded from new bookings

Deliverable:

- team changes do not corrupt future booking operations

## Files Likely Affected

### Existing reviewed files

- `app/Models/TeamMember.php`
- `app/Http/Controllers/Provider/Team/TeamMemberController.php`
- `resources/js/pages/provider/team/create.tsx`
- `resources/js/pages/provider/team/index.tsx`
- `database/migrations/2026_01_08_172542_create_team_members_table.php`
- `database/migrations/2026_01_08_172654_add_team_member_id_to_appointments_table.php`

### Additional likely files to inspect/change next

- appointment booking controller(s)
- slot availability service
- marketplace booking page/modal
- widget booking endpoints if widget should support staff selection
- provider schedule controller/views
- appointment detail pages
- request validation classes around appointment creation/rescheduling

## Open Decisions

These decisions are now confirmed for v1.

1. Team members should only be shown when a provider has more than one active accepted team member.
2. In v1, team members inherit provider business hours.
3. Team member choice is optional by default.
4. `team_member_id` remains `null` unless the client explicitly selects a team member.
5. Widget booking support is out of scope for this release.

## Suggested Delivery Order

Recommended order of execution:

1. stabilize current team management module
2. define booking payload and availability rules
3. implement team-member selection in booking UI
4. connect slot availability to selected team member
5. surface assignments in provider schedule and appointment details
6. add reassignment/deactivation safeguards

## Acceptance Criteria

The feature can be considered complete for v1 when:

- provider can add and manage active team members
- invited users can accept invitations successfully
- booking UI shows active accepted team members
- client can choose a team member or book without choosing one
- selected team member affects available slots
- appointment stores and displays `team_member_id`
- deactivated/invalid team members cannot be selected for new bookings
- existing appointments remain safe when team members are updated


#### next step
- make gallery page dynamic
- add google api key
