# Widget Guest Booking Implementation

## Overview
This document describes the guest booking feature for the embeddable widget, which automatically creates user accounts for anonymous visitors while maintaining data integrity.

## Key Features

### 1. Automatic Account Creation
- When a guest books via widget, system automatically creates a user account
- Uses email as the lookup key (prevents duplicate accounts)
- Generates secure random password
- Auto-verifies email (since they provided it)
- Sends account credentials via email

### 2. Payment Configuration
Providers can configure whether payment is required:
- **Require Payment (default)**: Customer must have sufficient wallet balance
- **No Payment Required**: Customer can request booking without payment (status: `requested`)

### 3. Guest Information Collection
Widget collects:
- Name (required)
- Email (required)
- Phone (optional)

## Implementation Details

### Files Created/Modified

#### New Files
1. `app/Services/UserService.php` - Handles guest user creation
2. `app/Mail/GuestAccountCreatedMail.php` - Sends account credentials
3. `resources/views/emails/guest/account-created.blade.php` - Email template

#### Modified Files
1. `app/Http/Controllers/Api/WidgetController.php` - Updated booking endpoint
2. `resources/js/widgets/booking-widget.tsx` - Added guest info form
3. `resources/js/pages/provider/business/settings.tsx` - Added payment configuration

### User Service

```php
UserService::findOrCreateGuestUser([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'phone' => '+2348000000000'
])
```

**Returns:**
- `user`: User model (existing or newly created)
- `is_new`: Boolean indicating if account was just created
- `password`: Plain password (only for new users, to send via email)

### Booking Flow

1. **Guest fills widget form** (name, email, phone, services, date, time)
2. **System finds or creates user** by email
3. **Checks payment requirement** from `widget_settings.requirePayment`
4. **If payment required:**
   - Checks wallet balance
   - Holds payment in escrow
   - Creates appointment with status `pending` or `confirmed`
5. **If payment not required:**
   - Creates appointment with status `requested`
   - Provider must review and accept
6. **Sends emails:**
   - Booking confirmation (always)
   - Account credentials (only if new user)

### Email Flow

**Booking Confirmation Email** (always sent):
- Standard appointment confirmation
- Includes booking details, date/time, provider info

**Account Created Email** (only for new users):
- Subject: "Your Account Has Been Created"
- Includes: Email, Password, Login link
- Message: "An account was created for you. You can log in anytime to view your bookings."

### Widget Settings

Providers can configure in Business Settings → Booking Widget:

```json
{
  "primaryColor": "#3B82F6",
  "size": "medium",
  "requirePayment": true  // or false
}
```

### API Endpoints

#### GET `/api/widget/{slug}/info`
Returns widget configuration including `requirePayment`:

```json
{
  "widget": {
    "requirePayment": true,
    "primaryColor": "#3B82F6",
    "size": "medium"
  }
}
```

#### POST `/api/widget/{slug}/book`
Accepts guest booking data:

```json
{
  "provider_id": "123",
  "service_ids": ["456"],
  "start_time": "2026-02-15T10:00:00Z",
  "notes": "Optional notes",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348000000000"
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "789",
    "status": "pending" // or "requested" if no payment
  },
  "message": "Appointment booked successfully!",
  "is_new_user": true
}
```

## Security Considerations

1. **Email Validation**: Basic email format validation on frontend
2. **Duplicate Prevention**: Email-based lookup prevents duplicate accounts
3. **Password Security**: Random 12-character passwords, hashed before storage
4. **Rate Limiting**: Should be added to prevent abuse (future enhancement)
5. **Spam Prevention**: Consider CAPTCHA for high-volume providers (future enhancement)

## Data Integrity

- Every booking has a user account (no truly anonymous bookings)
- Users can access their bookings later by logging in
- Email serves as the unique identifier
- Phone numbers are optional but recommended

## User Experience

### For Guests:
1. Fill out simple form (name, email, phone)
2. Select services and time
3. Submit booking
4. Receive confirmation email
5. Receive account credentials email (if new user)
6. Can log in later to manage bookings

### For Providers:
1. Enable widget in settings
2. Configure payment requirement
3. Customize appearance
4. Copy embed code
5. Paste on website
6. Receive bookings (with or without payment based on config)

## Future Enhancements

1. **Rate Limiting**: Per email/IP limits to prevent abuse
2. **CAPTCHA**: Optional CAPTCHA for guest bookings
3. **Email Verification**: Optional email verification before booking confirmation
4. **SMS OTP**: Optional phone verification for high-value providers
5. **Auto-expiry**: Auto-cancel unpaid `requested` bookings after X hours
6. **Payment Links**: Send payment link for `requested` bookings when provider accepts

## Testing Checklist

- [ ] Guest booking with payment required
- [ ] Guest booking without payment required
- [ ] Existing user booking (email already exists)
- [ ] New user account creation
- [ ] Email delivery (booking confirmation + account credentials)
- [ ] Wallet balance check for paid bookings
- [ ] Appointment status (pending vs requested)
- [ ] Provider can see bookings in dashboard
- [ ] User can log in with provided credentials
