# Stripe + Firebase Revenue Share Setup Guide

## Architecture Overview

```
[GitHub Pages - apps.html]  →  [Firebase Cloud Functions]  →  [Stripe API]
     (frontend UI)                (server-side logic)          (payments)
                                        ↓
                                  [Firestore DB]
                              (share records, transactions)
```

**Security model:** The client (apps.html) never touches Stripe directly. All pricing
is calculated server-side. Firestore security rules prevent any client writes to
share/payment collections. Only the webhook handler (triggered by Stripe after real
payment) can record share ownership.

---

## Prerequisites

1. **Firebase Blaze plan** (pay-as-you-go) — required for Cloud Functions
2. **Stripe account** — [dashboard.stripe.com](https://dashboard.stripe.com)
3. **Firebase CLI** — `npm install -g firebase-tools`
4. **Node.js 18+**

---

## Step 1: Install Dependencies

```bash
cd functions
npm install
```

---

## Step 2: Configure Stripe Keys

Get your keys from [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys).

```bash
# Set Stripe secret key (starts with sk_test_ or sk_live_)
firebase functions:config:set stripe.secret_key="sk_test_YOUR_KEY_HERE"

# Set Stripe webhook secret (we'll get this in Step 5)
# For now, skip this — come back after setting up the webhook
```

Verify config:
```bash
firebase functions:config:get
```

---

## Step 3: Deploy Cloud Functions

```bash
# From project root
firebase deploy --only functions
```

After deployment, you'll see URLs like:
```
✓ functions[getAppShareInfo]: https://us-central1-therobots-io.cloudfunctions.net/getAppShareInfo
✓ functions[createCheckoutSession]: https://us-central1-therobots-io.cloudfunctions.net/createCheckoutSession
✓ functions[handleStripeWebhook]: https://us-central1-therobots-io.cloudfunctions.net/handleStripeWebhook
✓ functions[getUserShares]: https://us-central1-therobots-io.cloudfunctions.net/getUserShares
```

---

## Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## Step 5: Set Up Stripe Webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Set the endpoint URL to: `https://us-central1-therobots-io.cloudfunctions.net/handleStripeWebhook`
4. Select event: `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **"Signing secret"** (starts with `whsec_`)
7. Set it in Firebase:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_YOUR_WEBHOOK_SECRET"
firebase deploy --only functions
```

---

## Step 6: Update Frontend URL

In `apps.html`, update the Cloud Functions base URL (search for `FUNCTIONS_BASE_URL`):

```javascript
const FUNCTIONS_BASE_URL = 'https://us-central1-therobots-io.cloudfunctions.net';
```

This should already be correct if your Firebase project ID is `therobots-io`.

---

## Step 7: Test

1. Use Stripe test mode keys (sk_test_...) first
2. Go to apps.html, sign in
3. Click "Buy 1% Share" on any app
4. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Verify in Firebase Console → Firestore that:
   - `apps_revenue/{appSlug}` was created/updated
   - `shares/{shareId}` was created
   - `transactions/{id}` was created

---

## Pricing Tiers

| Tier | Shares | Price/Share | Cumulative Total |
|------|--------|-------------|------------------|
| 1    | 1-10   | $10         | $100             |
| 2    | 11-20  | $25         | $350             |
| 3    | 21-30  | $50         | $850             |
| 4    | 31-40  | $100        | $1,850           |
| 5    | 41-49  | $200        | $3,650           |

- **Maximum shares per app:** 49 (owner retains 51%+)
- **Full app purchase:** $1,000 flat (only when 0 shares sold)
- **Revenue share activates:** At $1,000 lifetime revenue
- **Payout frequency:** Quarterly

---

## Firestore Collections

| Collection | Purpose | Client Access |
|------------|---------|---------------|
| `apps_revenue` | Per-app share stats | Read only |
| `shares` | Individual share records | Read only |
| `transactions` | Payment log | None |
| `payment_issues` | Oversold edge cases | None |
| `payouts` | Quarterly distributions | Read own |

---

## Going Live

1. Switch to **live Stripe keys** (sk_live_...)
2. Create a **new webhook** pointing to the same function URL with live mode
3. Update Firebase config:
```bash
firebase functions:config:set stripe.secret_key="sk_live_..." stripe.webhook_secret="whsec_LIVE_..."
firebase deploy --only functions
```

---

## Manual Revenue Tracking

Since revenue tracking is manual for now, update app revenue via Firebase Console
or a script:

```javascript
// In Firebase Console → Firestore → apps_revenue/{appSlug}
// Update the totalRevenue field
// When totalRevenue >= 100000 (cents = $1,000), set revenueShareActive: true
```
