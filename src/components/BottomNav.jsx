import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Compass, User } from "lucide-react";

const navItems = [
  { icon: Home, labelKey: "nav.home", path: "/" },
  { icon: Compass, labelKey: "nav.explore", path: "/explore" },
  { icon: User, labelKey: "nav.profile", path: "/profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/90 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.map(({ icon: Icon, labelKey, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                active ? "text-purple-600 dark:text-purple-400" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium tracking-wide ${active ? "font-semibold" : ""}`}>
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}