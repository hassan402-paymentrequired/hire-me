# Role System Update - Dual Client/Provider Support

## Overview
The system has been updated to allow users to be both clients and providers with the same account. Users can now switch to provider mode by setting up their business profile.

## Key Changes

### 1. User Model Updates
- `isProvider()` now checks for `businessProfile` instead of role
- Added `hasProviderSetup()` method
- `isClient()` returns true for all authenticated users

### 2. Registration Changes
- All new users default to `'client'` role
- Role selection removed from registration form
- Users can become providers later by setting up business profile

### 3. Middleware Updates
- `BusinessProviderMiddleware`: Now checks `hasProviderSetup()` instead of role
- `EnsureSetup`: Updated to check business profile existence
- `EnsureOnboardingComplete`: Updated to check provider setup

### 4. Controller Updates
- All role-based queries updated to check `whereHas('businessProfile')`
- Controllers now use `hasProviderSetup()` instead of role checks

### 5. New Features
- **Become Provider Flow**: New route `/become-provider` for users to start provider setup
- Users can access provider features once they complete onboarding

## Migration Path

### For Existing Users
Existing users with `role = 'provider'` will continue to work if they have a business profile. If they don't have a business profile, they'll be prompted to complete onboarding.

### For New Users
1. Register as normal (defaults to client)
2. Can book appointments immediately
3. Can click "Become a Provider" to start provider setup
4. Complete onboarding to unlock provider features

## Frontend Updates Needed

### 1. Registration Form
- Remove role selection dropdown
- All users register as clients by default

### 2. Navigation/Header
- Add "Become a Provider" button/link for users without provider setup
- Show provider dashboard link for users with provider setup
- Allow switching between client and provider views

### 3. Become Provider Page
Create `resources/js/pages/provider/become-provider.tsx`:
- Welcome message
- Benefits of becoming a provider
- "Start Setup" button that redirects to onboarding

## Benefits

1. **Flexibility**: Users can be both clients and providers
2. **No Duplicate Accounts**: Single account for all activities
3. **Easy Onboarding**: Users can become providers anytime
4. **Better UX**: No need to choose role at registration

## Testing Checklist

- [ ] New user registration defaults to client
- [ ] Client can book appointments
- [ ] Client can access "Become Provider" page
- [ ] Onboarding flow works for new providers
- [ ] Provider features accessible after onboarding
- [ ] Existing providers still work
- [ ] Marketplace shows only users with business profiles
- [ ] Middleware correctly checks provider setup
