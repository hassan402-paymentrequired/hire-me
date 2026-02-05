# Wallet & Escrow System Implementation

## Overview
This document describes the wallet and escrow system implemented to prevent booking abuse and build trust between clients and providers.

## Key Features

### 1. **Mandatory System Payment**
- All appointments require payment through the system wallet
- Clients must have sufficient wallet balance to book appointments
- Money is held in escrow until appointment completion

### 2. **Escrow System**
- When a client books an appointment, the full amount is held in escrow
- Funds are locked until the appointment is completed or cancelled
- Prevents clients from booking and cancelling without consequences

### 3. **Provider Payment Configuration**
Providers can configure payment release behavior:
- **Auto-release payment**: Payment is automatically released to provider's wallet when they confirm the appointment
- **Manual release**: Payment is released when appointment is marked as completed
- **Cancellation penalty**: Providers can set a percentage penalty (0-100%) for late cancellations (< 5 hours before appointment)

### 4. **Payment Release Scenarios**

#### Successful Completion
- **Client completes**: Escrow released to provider immediately
- **Provider completes**: Escrow released to provider immediately
- **Auto-release enabled**: Escrow released when provider confirms appointment

#### Cancellation
- **Early cancellation** (> 5 hours before): Full refund to client
- **Late cancellation** (< 5 hours before): 
  - If penalty configured: Client forfeits penalty percentage, provider receives penalty amount, rest refunded
  - If no penalty: Full refund to client
- **Provider cancellation**: Full refund to client (no penalty)

## Database Schema

### New Tables

#### `wallets`
- `user_id` (unique): Links to user
- `balance`: Total wallet balance
- `escrow_balance`: Amount currently held in escrow

#### `wallet_transactions`
- Tracks all wallet movements
- Types: `deposit`, `withdrawal`, `escrow_hold`, `escrow_release`, `escrow_refund`, `escrow_forfeit`
- Links to appointments for escrow-related transactions

### Updated Tables

#### `appointments`
- `escrow_amount`: Amount held in escrow for this appointment
- `escrow_status`: `pending`, `held`, `released`, `refunded`, `forfeited`
- `escrow_transaction_id`: Link to the escrow hold transaction
- `payment_released_at`: Timestamp when payment was released

## Implementation Details

### Models

#### `Wallet` Model
- `holdEscrow()`: Lock funds in escrow when booking
- `releaseEscrow()`: Release escrow to provider (deducts from client, credits provider)
- `refundEscrow()`: Return escrow to client's available balance
- `forfeitEscrow()`: Apply cancellation penalty (deducts from client, credits provider)
- `deposit()`: Add funds to wallet

#### `WalletTransaction` Model
- Records all wallet movements
- Links to appointments for escrow transactions
- Tracks balance before/after for audit trail

### Controllers

#### `Client\AppointmentController`
- **store()**: Checks wallet balance, creates escrow hold
- **cancel()**: Handles escrow refund/forfeit based on cancellation timing and provider settings
- **complete()**: Releases escrow to provider

#### `Provider\Schedule\ScheduleController`
- **confirmAppointment()**: Optionally releases escrow if auto-release enabled
- **cancelAppointment()**: Refunds escrow fully (provider cancellation)
- **completeAppointment()**: Releases escrow to provider

#### `Client\WalletController`
- **index()**: Shows wallet balance and transaction history
- **topUp()**: Handles wallet top-up (payment gateway integration needed)

### Frontend Updates

#### Booking Page (`marketplace/booking.tsx`)
- Displays wallet balance
- Shows insufficient balance warning
- Disables booking button if insufficient funds
- Redirects to wallet top-up if needed

#### Provider Settings (`provider/business/components/advance-setting.tsx`)
- Payment settings section added:
  - Auto-release payment toggle
  - Cancellation penalty percentage input

## Usage Flow

### Client Booking Flow
1. Client selects services and time slot
2. System checks wallet balance
3. If insufficient: Redirect to wallet top-up
4. If sufficient: Create appointment and escrow hold
5. Funds locked in escrow

### Payment Release Flow
1. **Option A - Auto-release**: Provider confirms → Payment released immediately
2. **Option B - Manual**: Appointment completed → Payment released
3. **Cancellation**: Based on timing and provider penalty settings

### Provider Configuration
1. Go to Business Settings → Advanced Settings
2. Configure payment settings:
   - Enable/disable auto-release
   - Set cancellation penalty percentage (0-100%)

## Migration Steps

Run the following migrations:
```bash
php artisan migrate
```

This will create:
- `wallets` table
- `wallet_transactions` table
- Add escrow fields to `appointments` table

## Payment Gateway Integration

The `WalletController::topUp()` method currently has a placeholder for payment gateway integration. You'll need to:

1. Integrate with your payment provider (Paystack, Stripe, etc.)
2. Verify payment before crediting wallet
3. Handle payment callbacks/webhooks
4. Update transaction status based on payment verification

## Future Enhancements

1. **Withdrawal System**: Allow providers to withdraw funds from their wallet
2. **Payment Gateway Integration**: Complete top-up flow with real payment processing
3. **Platform Fees**: Add platform commission deduction on payment release
4. **Refund Policies**: More granular refund rules (e.g., partial refunds for no-shows)
5. **Wallet History**: Enhanced transaction history with filters and search
6. **Notifications**: Email/SMS notifications for wallet transactions

## Security Considerations

- All escrow operations use database transactions for atomicity
- Wallet balance checks prevent double-spending
- Transaction history provides audit trail
- Escrow status prevents duplicate releases/refunds

## Testing Checklist

- [ ] Client can top up wallet
- [ ] Booking requires sufficient balance
- [ ] Escrow hold created on booking
- [ ] Early cancellation refunds fully
- [ ] Late cancellation applies penalty (if configured)
- [ ] Provider cancellation refunds fully
- [ ] Payment released on completion
- [ ] Auto-release works when enabled
- [ ] Provider receives payment in their wallet
- [ ] Transaction history records all movements
