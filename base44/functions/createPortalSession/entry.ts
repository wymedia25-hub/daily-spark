import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    const userEmail = user.email || "";

    if (!userEmail) {
      return Response.json({ error: "No email on account" }, { status: 400 });
    }

    // Look up the Stripe customer by email
    const customerRes = await fetch(
      `https://api.stripe.com/v1/customers?email=${encodeURIComponent(userEmail)}&limit=1`,
      {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      }
    );
    const customerData = await customerRes.json();

    if (customerData.error) {
      console.error("Stripe customer lookup error:", customerData.error);
      return Response.json({ error: customerData.error.message }, { status: 400 });
    }

    const customer = customerData.data?.[0];
    if (!customer) {
      return Response.json({ error: "No Stripe customer found" }, { status: 404 });
    }

    const ALLOWED_ORIGINS = [
      "https://dailysparkforfire.base44.app",
      "https://dailyspark.app",
      "http://localhost:5173",
      "http://localhost:3000",
    ];
    const rawOrigin = req.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : "https://dailysparkforfire.base44.app";

    // Create a Billing Portal session
    const params = new URLSearchParams();
    params.append("customer", customer.id);
    params.append("return_url", `${origin}/profile`);

    const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await portalRes.json();

    if (session.error) {
      console.error("Stripe portal error:", session.error);
      return Response.json({ error: session.error.message }, { status: 400 });
    }

    console.log("Portal session created for user:", user.id);
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});