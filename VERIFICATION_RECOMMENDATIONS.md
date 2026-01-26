# Provider Verification - Document Recommendations for Nigerian Small Businesses

## Overview
This document outlines the updated verification system designed specifically for Nigerian small businesses, addressing accessibility, security, and compliance concerns.

## Security Considerations

### ❌ **DO NOT Collect:**
- **NIN (National Identification Number)** - High security risk if compromised. Never store this.
- **BVN (Bank Verification Number)** - Extremely sensitive. Never request or store this.
- **Full Account Numbers** - Should be redacted in bank statements.

### ✅ **Safe to Collect:**
- Document images/photos (stored encrypted)
- Names and addresses (from utility bills)
- Business registration numbers (CAC, TIN)

## Document Types - Tiered Approach

### **Tier 1: Most Accessible (Recommended for Small Businesses)**
These are the easiest documents for most Nigerians to obtain:

1. **Voter's Card (PVC)** ⭐ **MOST RECOMMENDED**
   - Almost universal in Nigeria
   - Government-issued
   - Shows name and photo
   - Easy to verify

2. **Utility Bill** ⭐ **HIGHLY RECOMMENDED**
   - PHCN/NEPA electricity bill
   - Water bill
   - Internet service bill (last 3 months)
   - Shows address verification
   - Very common

3. **Bank Statement** (with redaction)
   - Last 3 months
   - Must redact: account numbers, transaction details, balances
   - Show only: name, address, bank name
   - Shows business activity

### **Tier 2: Government-Issued IDs**
For users who have them:

4. **Driver's License**
   - Valid driver's license
   - Government-issued
   - Shows photo and name

5. **National ID Card / NIN Slip**
   - NIN enrollment slip
   - National ID card (if available)
   - Note: We don't store the NIN number itself, just the document

6. **International Passport**
   - Valid passport data page
   - Less common among small business owners

### **Tier 3: Business Documents** (If Available)
For registered businesses:

7. **CAC Registration Document**
   - Corporate Affairs Commission certificate
   - Shows business is registered
   - Not all small businesses have this

8. **Tax Certificate (TIN)**
   - Tax Identification Number certificate
   - Shows tax compliance
   - Not all businesses have this

9. **Business License**
   - Local government or state business license
   - Varies by location and business type

## Implementation Details

### Frontend Changes
- Updated document type options with descriptions
- Added helpful guidance for users
- Security warnings about NIN/BVN
- Special instructions for bank statements

### Backend Changes
- Updated validation to accept all 9 document types
- Migration created to update database enum

### Database Migration
Run the migration to update the `document_type` enum:
```bash
php artisan migrate
```

## Verification Workflow

1. **User selects document type** from accessible options
2. **User uploads document** (JPG, PNG, or PDF, max 5MB)
3. **System stores document** encrypted in private storage
4. **Admin reviews** the document
5. **Status updated** (pending → approved/rejected)

## Best Practices for Admins

When reviewing documents:

1. **Voter's Card**: Verify name matches, photo is clear, card is valid
2. **Utility Bill**: Check name and address match, bill is recent (within 3 months)
3. **Bank Statement**: Verify name matches, ensure sensitive info is redacted
4. **Business Documents**: Verify registration numbers are valid, documents are current

## Why This Approach Works

1. **Accessibility**: Most Nigerians have a Voter's Card or utility bill
2. **Security**: We don't store sensitive numbers (NIN/BVN)
3. **Flexibility**: Multiple options accommodate different business types
4. **Trust**: Still provides verification without being overly restrictive
5. **Compliance**: Accepts government-issued documents

## Future Enhancements

Consider adding:
- Phone number verification (OTP) as a first step
- Bank account verification API (without storing BVN)
- Two-factor authentication
- Tiered verification levels (basic, standard, premium)

## Migration Notes

The migration updates the enum from:
```php
['passport', 'national_id', 'drivers_license']
```

To:
```php
[
    'voters_card',
    'utility_bill', 
    'bank_statement',
    'drivers_license',
    'national_id',
    'passport',
    'cac_registration',
    'tax_certificate',
    'business_license'
]
```

Existing records with old values will need to be handled (they should still work, but consider a data migration if needed).
