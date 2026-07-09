import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    const ALLOWED_PRICE_IDS = [
      "price_1TofZMDfkQwONAzfPns0Ydo4",
      "price_1TrA2EDfkQwONAzfejgtNZsj",
    ];
    if (!priceId || !ALLOWED_PRICE_IDS.includes(priceId)) {
      return Response.json({ error: "Invalid priceId" }, { status: 400 });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const ALLOWED_ORIGINS = [
      "https://dailysparkforfire.base44.app",
      "https://dailyspark.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];
    const rawOrigin = req.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : "https://dailysparkforfire.base44.app";

    // Derive identity from the authenticated session — never trust client-sent email/user_id
    const userEmail = user.email || "";
    const userId = user.id || "";

    // Look up the user's UserPreferences server-side
    let prefsId = "";
    try {
      const prefs = await base44.asServiceRole.entities.UserPreferences.filter(
        { created_by_id: userId },
        "-created_date",
        1
      );
      if (prefs.length > 0) prefsId = prefs[0].id;
    } catch (e) {
      console.error("Failed to lookup user preferences:", e.message);
    }

    const params = new URLSearchParams();
    params.append("payment_method_types[]", "card");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("mode", "subscription");
    params.append("subscription_data[trial_period_days]", "7");
    params.append("success_url", `${origin}/?success=true`);
    params.append("cancel_url", `${origin}/?canceled=true`);
    params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");
    params.append("metadata[user_id]", userId);
    if (userEmail) {
      params.append("customer_email", userEmail);
      params.append("metadata[user_email]", userEmail);
    }
    if (prefsId) {
      params.append("metadata[user_preferences_id]", prefsId);
    }
    // Mirror onto subscription so subscription-based webhook events carry verified identity
    params.append("subscription_data[metadata][user_id]", userId);
    if (userEmail) {
      params.append("subscription_data[metadata][user_email]", userEmail);
    }
    if (prefsId) {
      params.append("subscription_data[metadata][user_preferences_id]", prefsId);
    }

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await response.json();

    if (session.error) {
      console.error("Stripe error:", session.error);
      return Response.json({ error: session.error.message }, { status: 400 });
    }

    console.log("Checkout session created for user:", userId);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});