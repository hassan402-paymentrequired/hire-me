# Paystack Integration Guide

## Overview

This document describes the Paystack integration for wallet top-ups and provider withdrawals.

## Environment Variables

Add these to your `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Your Paystack secret key
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx   # Your Paystack public key
```

For production, use your live keys:

```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

## Webhook Configuration

### Setting up Paystack Webhook

1. Log in to your Paystack Dashboard
2. Go to Settings → API Keys & Webhooks
3. Add a webhook URL: `https://yourdomain.com/paystack/webhook`
4. Select events to listen for:
    - `charge.success`
    - `transfer.success`
    - `transfer.failed`

### Webhook Security

The webhook handler verifies the signature using HMAC SHA512. Make sure your webhook URL is accessible and the signature verification is working.

## API Endpoints

### Client Wallet Top-Up

#### Initialize Payment

```
POST /wallet/top-up/initialize
```

**Request:**

```json
{
    "amount": 5000
}
```

**Response:**

```json
{
    "success": true,
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "WLT_..."
}
```

#### Verify Payment (after redirect)

```
POST /wallet/top-up/verify
```

**Request:**

```json
{
    "reference": "WLT_..."
}
```

### Provider Withdrawal

#### Get Banks List

The withdrawal page automatically fetches banks from Paystack.

#### Create Transfer Recipient

```
POST /wallet/withdraw/recipient
```

**Request:**

```json
{
    "account_number": "0123456789",
    "bank_code": "058",
    "account_name": "John Doe"
}
```

#### Initiate Withdrawal

```
POST /wallet/withdraw
```

**Request:**

```json
{
    "amount": 10000,
    "recipient_code": "RCP_...",
    "account_name": "John Doe",
    "bank_name": "GTBank"
}
```

## Frontend Integration

### Wallet Top-Up Flow

1. User clicks "Top Up Wallet"
2. Enter amount
3. Call `/wallet/top-up/initialize` to get authorization URL
4. Redirect user to Paystack checkout
5. After payment, Paystack redirects to `/paystack/callback`
6. Verify payment and credit wallet

### Withdrawal Flow

1. Provider navigates to withdrawal page
2. Select bank and enter account details
3. Create recipient (if not exists)
4. Enter withdrawal amount
5. Submit withdrawal request
6. Amount deducted from wallet immediately
7. Paystack processes transfer (webhook updates status)

## Testing

### Test Cards (Paystack Test Mode)

- **Successful Payment**: `4084084084084081`
- **Declined Payment**: `4084084084084085`
- **Insufficient Funds**: `4084084084084093`

### Test Bank Accounts

Use Paystack's test bank accounts for withdrawal testing:

- Account Number: `0123456789`
- Bank Code: `058` (GTBank)

## Transaction Flow

### Top-Up Flow

1. Client initiates top-up → Creates pending transaction
2. Paystack payment page → User pays
3. Paystack webhook → Updates transaction to completed
4. Wallet credited → Balance updated

### Withdrawal Flow

1. Provider initiates withdrawal → Creates pending transaction
2. Wallet balance deducted immediately
3. Paystack transfer initiated
4. Webhook confirms success/failure
5. Transaction status updated

## Error Handling

### Common Errors

1. **Insufficient Balance**: Check wallet balance before withdrawal
2. **Invalid Bank Details**: Verify account number and bank code
3. **Transfer Failed**: Webhook will refund amount back to wallet
4. **Payment Failed**: Transaction marked as failed, no wallet credit

## Security Considerations

1. **Webhook Signature Verification**: Always verify webhook signatures
2. **Amount Validation**: Validate amounts on both frontend and backend
3. **Transaction References**: Use unique references for all transactions
4. **Idempotency**: Check for duplicate transactions using references

## Monitoring

Monitor these metrics:

- Failed payment attempts
- Failed withdrawal attempts
- Webhook processing errors
- Transaction completion rates

## Support

For Paystack API issues:

- Documentation: https://paystack.com/docs/api
- Support: support@paystack.com
