import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const secretKey = Deno.env.get("STRIPE_SECRET_KEY");

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const prefsId = session.metadata?.user_preferences_id;
        const email = session.metadata?.user_email || session.customer_email;

        if (prefsId) {
          await base44.asServiceRole.entities.UserPreferences.update(prefsId, { is_premium: true });
          console.log(`Premium activated for preferences ${prefsId} (${email})`);
        } else if (email) {
          const allPrefs = await base44.asServiceRole.entities.UserPreferences.list(500);
          for (const p of allPrefs) {
            if (p.created_by_id) {
              try {
                const u = await base44.asServiceRole.entities.User.get(p.created_by_id);
                if (u?.email === email) {
                  await base44.asServiceRole.entities.UserPreferences.update(p.id, { is_premium: true });
                  console.log(`Premium activated for ${email}`);
                  break;
                }
              } catch (e) { /* skip */ }
            }
          }
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const prefsId = subscription.metadata?.user_preferences_id;
        if (prefsId) {
          await base44.asServiceRole.entities.UserPreferences.update(prefsId, { is_premium: false });
          console.log(`Premium deactivated for preferences ${prefsId}`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});