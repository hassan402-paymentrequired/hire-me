# Paystack Integration Setup Instructions

## Quick Setup Guide

### 1. Environment Variables

Add these to your `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

**Get your keys from:**
- Paystack Dashboard → Settings → API Keys & Webhooks
- Use test keys for development
- Use live keys for production

### 2. Webhook Configuration

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → API Keys & Webhooks**
3. Click **Add Webhook**
4. Enter webhook URL: `https://yourdomain.com/paystack/webhook`
5. Select events:
   - ✅ `charge.success`
   - ✅ `transfer.success`
   - ✅ `transfer.failed`
6. Save webhook

**For local development**, use a tool like:
- [ngrok](https://ngrok.com) to expose local server
- Webhook URL: `https://your-ngrok-url.ngrok.io/paystack/webhook`

### 3. Testing

#### Test Cards (Test Mode)
- **Success**: `4084084084084081`
- **Declined**: `4084084084084085`
- **Insufficient Funds**: `4084084084084093`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

#### Test Bank Accounts
- Account Number: `0123456789`
- Bank Code: `058` (GTBank)

### 4. Frontend Pages Needed

You'll need to create these frontend pages:

1. **Client Wallet Page** (`resources/js/pages/client/wallet/index.tsx`)
   - Display wallet balance
   - Show transaction history
   - Top-up button/form
   - Integrate Paystack inline payment or redirect

2. **Provider Withdrawal Page** (`resources/js/pages/provider/wallet/withdraw.tsx`)
   - Display wallet balance
   - Bank selection dropdown
   - Account details form
   - Withdrawal history
   - Withdrawal form

### 5. Payment Flow

#### Top-Up Flow:
1. User clicks "Top Up"
2. Enters amount
3. Frontend calls `/wallet/top-up/initialize`
4. Gets authorization URL from Paystack
5. Redirects user to Paystack checkout
6. User completes payment
7. Paystack redirects to `/paystack/callback`
8. Webhook confirms payment
9. Wallet credited

#### Withdrawal Flow:
1. Provider enters bank details
2. Creates recipient (if needed)
3. Enters withdrawal amount
4. Submits withdrawal
5. Wallet balance deducted immediately
6. Paystack processes transfer
7. Webhook updates status (success/failed)
8. If failed, amount refunded to wallet

### 6. Important Notes

- **Webhook Security**: Always verify webhook signatures
- **Idempotency**: Check for duplicate transactions using references
- **Error Handling**: Handle failed payments and transfers gracefully
- **Transaction References**: Use unique references for all transactions
- **Amount Validation**: Validate amounts on both frontend and backend

### 7. API Endpoints Summary

#### Client Endpoints
- `GET /wallet` - View wallet and transactions
- `POST /wallet/top-up/initialize` - Initialize Paystack payment
- `POST /wallet/top-up/verify` - Verify payment (optional, webhook handles it)

#### Provider Endpoints
- `GET /wallet/withdraw` - View withdrawal page
- `POST /wallet/withdraw/recipient` - Create bank recipient
- `POST /wallet/withdraw` - Initiate withdrawal

#### Webhook Endpoints
- `POST /paystack/webhook` - Paystack webhook handler
- `GET /paystack/callback` - Payment redirect callback

### 8. Next Steps

1. ✅ Backend integration complete
2. ⏳ Create frontend wallet page
3. ⏳ Create frontend withdrawal page
4. ⏳ Test payment flow
5. ⏳ Test withdrawal flow
6. ⏳ Set up production webhook

### 9. Troubleshooting

**Payment not crediting wallet:**
- Check webhook is configured correctly
- Verify webhook signature verification
- Check transaction status in Paystack dashboard
- Review application logs

**Withdrawal failing:**
- Verify bank account details
- Check Paystack transfer limits
- Verify recipient code is valid
- Check Paystack dashboard for error messages

**Webhook not receiving events:**
- Verify webhook URL is accessible
- Check webhook is enabled in Paystack dashboard
- Test webhook with Paystack's test tool
- Check server logs for webhook requests
