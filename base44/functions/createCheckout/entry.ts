import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { priceId, email, user_preferences_id } = body;

    if (!priceId) {
      return Response.json({ error: "Missing priceId" }, { status: 400 });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const ALLOWED_ORIGINS = [
      "https://dailyspark.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];
    const rawOrigin = req.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : "https://dailyspark.app";

    const params = new URLSearchParams();
    params.append("payment_method_types[]", "card");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("mode", "subscription");
    params.append("subscription_data[trial_period_days]", "7");
    params.append("success_url", `${origin}/?success=true`);
    params.append("cancel_url", `${origin}/?canceled=true`);
    params.append("metadata[base44_app_id]", Deno.env.get("BASE44_APP_ID") || "");

    if (email) {
      params.append("customer_email", email);
      params.append("metadata[user_email]", email);
    }
    if (user_preferences_id) {
      params.append("metadata[user_preferences_id]", user_preferences_id);
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

    console.log("Checkout session created for:", email || "guest");
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});