import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;

    const [prefs, activities, userQuotes, progress] = await Promise.all([
      svc.entities.UserPreferences.filter({ created_by_id: user.id }),
      svc.entities.UserActivity.filter({ created_by_id: user.id }),
      svc.entities.UserQuote.filter({ created_by_id: user.id }),
      svc.entities.UserProgress.filter({ created_by_id: user.id }),
    ]);

    await Promise.all([
      ...prefs.map((p) => svc.entities.UserPreferences.delete(p.id)),
      ...activities.map((a) => svc.entities.UserActivity.delete(a.id)),
      ...userQuotes.map((q) => svc.entities.UserQuote.delete(q.id)),
      ...progress.map((p) => svc.entities.UserProgress.delete(p.id)),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error('deleteAccount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});