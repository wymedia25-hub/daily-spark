import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await base44.entities.UserPreferences.filter({ created_by_id: user.id }, "-created_date", 1);
        if (!cancelled && p[0]?.language_code) {
          i18n.changeLanguage(p[0].language_code);
        }
      } catch (e) {}
    })();
    return () => { cancelled = true; };
  }, [isLoadingAuth, isAuthenticated, user, i18n]);

  return children;
}