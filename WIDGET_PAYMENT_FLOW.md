# Widget Payment Flow - Improved UX

## Overview
The widget now supports seamless payment directly on the provider's website without redirecting users away. Users can choose between wallet payment (if they have sufficient balance) or Paystack payment.

## Key Features

### 1. Automatic Wallet Creation
- When a guest user account is created, a wallet is automatically created with 0 balance
- Ensures every user has a wallet ready for future transactions

### 2. Smart Payment Options
- **Wallet Payment**: Shown if user has sufficient balance
- **Paystack Payment**: Always available as fallback
- Both options visible when user has sufficient wallet balance
- Only Paystack shown if insufficient balance or new user

### 3. Seamless User Experience
- No redirects away from provider's website
- Payment happens inline via Paystack
- Wallet balance checked automatically when email is entered
- Real-time balance display

## Payment Flow

### Step 1: User Enters Email
- Widget automatically checks wallet balance (debounced 500ms)
- Shows balance in summary section
- Indicates if balance is sufficient

### Step 2: User Selects Payment Method

#### Option A: Pay from Wallet
- Available if: `walletBalance >= totalPrice`
- One-click booking
- Payment held in escrow immediately
- Booking confirmed instantly

#### Option B: Pay with Paystack
- Always available
- Redirects to Paystack checkout
- User completes payment on Paystack
- Redirects back to widget callback
- Booking created after payment verification

### Step 3: Booking Confirmation
- Appointment created
- Payment held in escrow (if paid)
- Confirmation email sent
- Account credentials sent (if new user)

## API Endpoints

### 1. Check Wallet Balance
```
POST /api/widget/{slug}/check-wallet
Body: { email: "user@example.com" }
Response: { has_wallet: true, balance: 5000, user_id: "123" }
```

### 2. Initialize Paystack Payment
```
POST /api/widget/{slug}/initialize-payment
Body: {
  provider_id: "123",
  service_ids: ["456"],
  start_time: "2026-02-15T10:00:00Z",
  name: "John Doe",
  email: "john@example.com",
  phone: "+2348000000000",
  notes: "Optional notes"
}
Response: {
  success: true,
  authorization_url: "https://paystack.com/...",
  reference: "WGT_..."
}
```

### 3. Book with Wallet
```
POST /api/widget/{slug}/book
Body: {
  ... (same as initialize-payment)
  payment_method: "wallet"
}
Response: {
  success: true,
  appointment: { id: "789", status: "pending" },
  message: "Appointment booked successfully!",
  is_new_user: false
}
```

### 4. Payment Callback
```
GET /api/widget/{slug}/payment/callback?reference=WGT_...
- Verifies Paystack payment
- Creates appointment
- Credits wallet
- Holds payment in escrow
- Sends confirmation emails
```

## Implementation Details

### UserService Updates
- Now creates wallet when creating new user
- Returns user, is_new flag, and password

### Widget Component Updates
- Real-time wallet balance checking
- Two payment buttons (wallet + Paystack)
- Balance display in summary
- Paystack redirect handling

### Booking Flow
1. User enters email → Wallet checked automatically
2. User sees payment options based on balance
3. User clicks payment method
4. If wallet: Booking created immediately
5. If Paystack: Redirects to Paystack → Callback → Booking created

## Benefits

1. **Better UX**: No redirects away from provider's site
2. **Flexibility**: Users can choose payment method
3. **Speed**: Wallet payments are instant
4. **Trust**: Paystack provides secure payment option
5. **Data Integrity**: Every booking has a user account

## Security

- Wallet balance checked server-side
- Paystack payment verified before booking creation
- Booking data stored in cache temporarily (30 min expiry)
- Reference-based payment tracking
- Webhook support for payment verification

## Testing Checklist

- [ ] New user booking with Paystack
- [ ] Existing user with sufficient wallet balance
- [ ] Existing user with insufficient wallet balance
- [ ] Wallet payment flow
- [ ] Paystack payment flow
- [ ] Payment callback handling
- [ ] Email delivery (confirmation + credentials)
- [ ] Wallet balance display
- [ ] Payment method visibility logic
