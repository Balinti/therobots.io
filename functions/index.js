const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

// CORS middleware for callable endpoints
const corsHandler = cors({origin: true});

// =============================================================================
// PRICING TIERS - Revenue Share Model
// =============================================================================
// 49 shares max per app (owner keeps 51%+)
// Tiered pricing: earlier buyers get lower prices
//
// Tier 1: Shares  1-10  → $10 each  ($100 cumulative)
// Tier 2: Shares 11-20  → $25 each  ($350 cumulative)
// Tier 3: Shares 21-30  → $50 each  ($850 cumulative)
// Tier 4: Shares 31-40  → $100 each ($1,850 cumulative)
// Tier 5: Shares 41-49  → $200 each ($3,650 cumulative)
//
// Full app purchase: $1,000 flat (only when 0 shares sold)
// =============================================================================

const PRICING_TIERS = [
  {minShare: 1, maxShare: 10, pricePerShare: 1000}, // $10.00 in cents
  {minShare: 11, maxShare: 20, pricePerShare: 2500}, // $25.00
  {minShare: 21, maxShare: 30, pricePerShare: 5000}, // $50.00
  {minShare: 31, maxShare: 40, pricePerShare: 10000}, // $100.00
  {minShare: 41, maxShare: 49, pricePerShare: 20000}, // $200.00
];

const MAX_SHARES = 49;
const FULL_APP_PRICE = 100000; // $1,000.00 in cents

/**
 * Get the current price per share based on how many are already sold.
 * @param {number} sharesSold - Number of shares already sold
 * @return {number} Price in cents for the next share
 */
function getCurrentSharePrice(sharesSold) {
  const nextShare = sharesSold + 1;
  for (const tier of PRICING_TIERS) {
    if (nextShare >= tier.minShare && nextShare <= tier.maxShare) {
      return tier.pricePerShare;
    }
  }
  return null; // All shares sold
}

/**
 * Get tier info for display purposes.
 * @param {number} sharesSold - Number of shares already sold
 * @return {object} Current tier details
 */
function getTierInfo(sharesSold) {
  const nextShare = sharesSold + 1;
  for (let i = 0; i < PRICING_TIERS.length; i++) {
    const tier = PRICING_TIERS[i];
    if (nextShare >= tier.minShare && nextShare <= tier.maxShare) {
      return {
        tierNumber: i + 1,
        pricePerShare: tier.pricePerShare,
        sharesRemainingInTier: tier.maxShare - sharesSold,
        totalTiers: PRICING_TIERS.length,
      };
    }
  }
  return null;
}

/**
 * Initialize Stripe with the secret key from Firebase config.
 * Set via: firebase functions:config:set stripe.secret_key="sk_..."
 *          firebase functions:config:set stripe.webhook_secret="whsec_..."
 * @return {object} Stripe instance
 */
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe secret key not configured. Add STRIPE_SECRET_KEY to functions/.env");
  }
  return stripe(secretKey);
}

// =============================================================================
// 1. GET APP SHARE INFO
// =============================================================================
// Public endpoint - returns share availability and pricing for an app
// =============================================================================

exports.getAppShareInfo = onRequest({invoker: "public"}, (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const {appSlug} = req.query;

      if (!appSlug) {
        res.status(400).json({error: "appSlug is required"});
        return;
      }

      // Get or create the app revenue document
      const appRef = db.collection("apps_revenue").doc(appSlug);
      const appDoc = await appRef.get();

      let appData;
      if (!appDoc.exists) {
        // First time anyone checks this app - create default record
        appData = {
          totalSharesSold: 0,
          totalRevenue: 0,
          revenueShareActive: false,
          isFullyOwned: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await appRef.set(appData);
        appData.createdAt = new Date().toISOString();
      } else {
        appData = appDoc.data();
      }

      const sharesSold = appData.totalSharesSold || 0;
      const sharesRemaining = MAX_SHARES - sharesSold;
      const tierInfo = getTierInfo(sharesSold);
      const currentPrice = getCurrentSharePrice(sharesSold);

      // Get list of shareholders (public: how many people, not who)
      const sharesSnapshot = await db.collection("shares")
          .where("appSlug", "==", appSlug)
          .get();

      const uniqueHolders = new Set();
      sharesSnapshot.forEach((doc) => {
        uniqueHolders.add(doc.data().userId);
      });

      res.json({
        appSlug,
        totalSharesSold: sharesSold,
        sharesRemaining,
        maxShares: MAX_SHARES,
        currentPricePerShare: currentPrice, // in cents
        currentPriceDisplay: currentPrice ? `$${(currentPrice / 100).toFixed(0)}` : null,
        tierInfo,
        pricingTiers: PRICING_TIERS.map((t) => ({
          shares: `${t.minShare}-${t.maxShare}`,
          price: `$${(t.pricePerShare / 100).toFixed(0)}`,
          priceCents: t.pricePerShare,
        })),
        fullAppPurchaseAvailable: sharesSold === 0 && !appData.isFullyOwned,
        fullAppPrice: FULL_APP_PRICE,
        fullAppPriceDisplay: `$${(FULL_APP_PRICE / 100).toFixed(0)}`,
        isFullyOwned: appData.isFullyOwned || false,
        revenueShareActive: appData.revenueShareActive || false,
        totalRevenue: appData.totalRevenue || 0,
        holderCount: uniqueHolders.size,
      });
    } catch (error) {
      console.error("getAppShareInfo error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  });
});

// =============================================================================
// 2. CREATE CHECKOUT SESSION
// =============================================================================
// Authenticated endpoint - creates a Stripe Checkout session for share purchase
// Validates: auth, share availability, calculates price server-side
// =============================================================================

exports.createCheckoutSession = onRequest({invoker: "public"}, (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      // Verify Firebase auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({error: "Authentication required"});
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (authError) {
        res.status(401).json({error: "Invalid authentication token"});
        return;
      }

      const userId = decodedToken.uid;
      const userEmail = decodedToken.email || "";
      const {appSlug, appName, purchaseType, quantity} = req.body;

      if (!appSlug || !appName) {
        res.status(400).json({error: "appSlug and appName are required"});
        return;
      }

      const stripeClient = getStripe();

      // Use a Firestore transaction to ensure atomic reads
      const result = await db.runTransaction(async (transaction) => {
        const appRef = db.collection("apps_revenue").doc(appSlug);
        const appDoc = await transaction.get(appRef);

        let appData;
        if (!appDoc.exists) {
          appData = {
            totalSharesSold: 0,
            totalRevenue: 0,
            revenueShareActive: false,
            isFullyOwned: false,
          };
        } else {
          appData = appDoc.data();
        }

        if (appData.isFullyOwned) {
          throw new Error("This app has already been fully purchased");
        }

        const sharesSold = appData.totalSharesSold || 0;

        if (purchaseType === "full") {
          // Full app purchase - only when 0 shares sold
          if (sharesSold > 0) {
            throw new Error("Cannot purchase full app - revenue shares have already been sold");
          }

          return {
            type: "full",
            price: FULL_APP_PRICE,
            shares: MAX_SHARES,
            description: `Full purchase of "${appName}" (all ${MAX_SHARES} revenue shares)`,
          };
        } else {
          // Individual share purchase
          const numShares = Math.min(
              Math.max(parseInt(quantity) || 1, 1),
              MAX_SHARES - sharesSold,
          );

          if (numShares <= 0) {
            throw new Error("No shares available for this app");
          }

          // Calculate total price for requested shares
          let totalPrice = 0;
          let currentSold = sharesSold;
          const priceBreakdown = [];

          for (let i = 0; i < numShares; i++) {
            const price = getCurrentSharePrice(currentSold);
            if (!price) {
              throw new Error(`Only ${i} shares available`);
            }
            totalPrice += price;
            priceBreakdown.push({share: currentSold + 1, price});
            currentSold++;
          }

          return {
            type: "share",
            price: totalPrice,
            shares: numShares,
            priceBreakdown,
            description: numShares === 1 ?
              `1% revenue share of "${appName}" (Share #${sharesSold + 1})` :
              `${numShares}% revenue share of "${appName}" (Shares #${sharesSold + 1}-${sharesSold + numShares})`,
          };
        }
      });

      // Create Stripe Checkout Session
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: userEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: result.description,
                description: result.type === "full" ?
                  `Complete ownership of ${appName} with all revenue rights` :
                  `Revenue share ownership in ${appName}. Share activates at $1,000 lifetime revenue.`,
                metadata: {
                  appSlug,
                  type: result.type,
                },
              },
              unit_amount: result.price,
            },
            quantity: 1,
          },
        ],
        metadata: {
          appSlug,
          appName,
          userId,
          userEmail,
          purchaseType: result.type,
          sharesCount: result.shares.toString(),
        },
        success_url: `${req.headers.origin || "https://therobots.io"}/apps.html?purchase=success&app=${appSlug}`,
        cancel_url: `${req.headers.origin || "https://therobots.io"}/apps.html?purchase=cancelled&app=${appSlug}`,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error) {
      console.error("createCheckoutSession error:", error);
      res.status(error.message.includes("already") || error.message.includes("Cannot") || error.message.includes("No shares") ? 400 : 500)
          .json({error: error.message || "Internal server error"});
    }
  });
});

// =============================================================================
// 3. STRIPE WEBHOOK HANDLER
// =============================================================================
// Receives verified Stripe webhook events and updates Firestore
// This is the ONLY way shares get recorded - no client can fake this
// =============================================================================

exports.handleStripeWebhook = onRequest({invoker: "public"}, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Stripe webhook secret not configured");
    res.status(500).send("Webhook not configured");
    return;
  }

  const stripeClient = getStripe();
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
        req.rawBody,
        sig,
        webhookSecret,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;

    if (!metadata || !metadata.appSlug || !metadata.userId) {
      console.error("Missing metadata in checkout session:", session.id);
      res.status(400).send("Missing metadata");
      return;
    }

    const {appSlug, appName, userId, userEmail, purchaseType, sharesCount} = metadata;
    const numShares = parseInt(sharesCount) || 1;

    try {
      await db.runTransaction(async (transaction) => {
        const appRef = db.collection("apps_revenue").doc(appSlug);
        const appDoc = await transaction.get(appRef);

        let appData;
        if (!appDoc.exists) {
          appData = {totalSharesSold: 0, totalRevenue: 0, revenueShareActive: false, isFullyOwned: false};
        } else {
          appData = appDoc.data();
        }

        // Double-check availability (race condition protection)
        const currentSold = appData.totalSharesSold || 0;
        if (currentSold + numShares > MAX_SHARES) {
          // This shouldn't happen if checkout was validated, but safety first
          // Stripe payment was already collected - we'd need to issue a refund
          console.error(`CRITICAL: Oversold shares for ${appSlug}. Current: ${currentSold}, Attempted: ${numShares}`);
          // Record the issue for manual review
          transaction.set(db.collection("payment_issues").doc(), {
            type: "oversold",
            appSlug,
            userId,
            sessionId: session.id,
            paymentIntentId: session.payment_intent,
            attemptedShares: numShares,
            currentSharesSold: currentSold,
            amountPaid: session.amount_total,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            resolved: false,
          });
          return;
        }

        // Record the share purchase
        const shareDocId = `${appSlug}_${userId}_${Date.now()}`;
        const shareRef = db.collection("shares").doc(shareDocId);

        transaction.set(shareRef, {
          appSlug,
          appName: appName || appSlug,
          userId,
          userEmail: userEmail || "",
          sharesOwned: numShares,
          totalPaid: session.amount_total,
          purchaseType,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update app revenue document
        const isFullPurchase = purchaseType === "full";
        transaction.set(appRef, {
          totalSharesSold: currentSold + numShares,
          isFullyOwned: isFullPurchase,
          lastPurchaseAt: admin.firestore.FieldValue.serverTimestamp(),
          ...(appDoc.exists ? {} : {
            totalRevenue: 0,
            revenueShareActive: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          }),
        }, {merge: true});

        // Record in transactions log
        transaction.set(db.collection("transactions").doc(), {
          type: isFullPurchase ? "full_purchase" : "share_purchase",
          appSlug,
          userId,
          userEmail: userEmail || "",
          sharesCount: numShares,
          amount: session.amount_total,
          currency: session.currency,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      console.log(`Successfully recorded ${purchaseType} purchase for ${appSlug} by ${userId}`);
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Error processing payment");
      return;
    }
  }

  res.json({received: true});
});

// =============================================================================
// 4. GET USER SHARES (authenticated)
// =============================================================================
// Returns all shares owned by the authenticated user
// =============================================================================

exports.getUserShares = onRequest({invoker: "public"}, (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({error: "Authentication required"});
        return;
      }

      const idToken = authHeader.split("Bearer ")[1];
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (authError) {
        res.status(401).json({error: "Invalid authentication token"});
        return;
      }

      const userId = decodedToken.uid;

      const sharesSnapshot = await db.collection("shares")
          .where("userId", "==", userId)
          .get();

      const shares = [];
      sharesSnapshot.forEach((doc) => {
        const data = doc.data();
        shares.push({
          id: doc.id,
          appSlug: data.appSlug,
          appName: data.appName,
          sharesOwned: data.sharesOwned,
          totalPaid: data.totalPaid,
          purchaseType: data.purchaseType,
          purchasedAt: data.purchasedAt?.toDate?.()?.toISOString() || null,
        });
      });

      res.json({shares});
    } catch (error) {
      console.error("getUserShares error:", error);
      res.status(500).json({error: "Internal server error"});
    }
  });
});
