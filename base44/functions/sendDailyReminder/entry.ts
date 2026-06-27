import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const currentHour = now.getUTCHours().toString().padStart(2, "0");

    const allPrefs = await base44.asServiceRole.entities.UserPreferences.list(500);
    const matching = allPrefs.filter(p =>
      p.onboarding_complete === true &&
      p.reminder_time &&
      p.reminder_time.startsWith(currentHour)
    );

    let sentCount = 0;
    for (const pref of matching) {
      try {
        if (!pref.created_by_id) continue;
        const user = await base44.asServiceRole.entities.User.get(pref.created_by_id);
        if (!user?.email) continue;

        const allQuotes = await base44.asServiceRole.entities.Quote.list(200);
        const relevant = allQuotes.filter(q => pref.focus_areas?.includes(q.topic));
        const pool = relevant.length > 0 ? relevant : allQuotes;
        const quote = pool[Math.floor(Math.random() * pool.length)];
        if (!quote) continue;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: "Your Daily Spark ✨",
          body: `<div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; text-align: center;">
            <h2 style="color: #7C3AED; margin-bottom: 24px;">Your Daily Spark</h2>
            <p style="font-size: 22px; line-height: 1.6; color: #1f2937; font-style: italic;">"${quote.text}"</p>
            ${quote.author ? `<p style="color: #6b7280; margin-top: 16px;">— ${quote.author}</p>` : ""}
            <p style="color: #9ca3af; margin-top: 32px; font-size: 14px;">Open Daily Spark for more inspiration</p>
          </div>`,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed for pref ${pref.id}:`, err.message);
      }
    }

    console.log(`Sent ${sentCount} reminder emails (hour ${currentHour} UTC)`);
    return Response.json({ sent: sentCount, hour: currentHour });
  } catch (error) {
    console.error("Reminder error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});