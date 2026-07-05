import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./BottomNav";
import { getNavDirection, setNavDirection, isTabRoot } from "@/lib/navigationState";

const getEffectiveDirection = (explicit, fromPath, toPath) => {
  if (explicit !== "none") return explicit;
  const fromTab = isTabRoot(fromPath);
  const toTab = isTabRoot(toPath);
  if (fromTab && !toTab) return "push";
  if (!fromTab && toTab) return "pop";
  if (!fromTab && !toTab) return "push";
  return "none";
};

const pageVariants = {
  enter: (d) => {
    if (d === "none") return { x: 0, opacity: 1 };
    return { x: d === "push" ? 80 : -80, opacity: 0 };
  },
  center: { x: 0, opacity: 1 },
  exit: (d) => {
    if (d === "none") return { x: 0, opacity: 1 };
    return { x: d === "push" ? -80 : 80, opacity: 0 };
  },
};

export default function AppLayout() {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const directionRef = useRef("none");
  const scrollMapRef = useRef({});

  if (prevPathRef.current !== location.pathname) {
    directionRef.current = getEffectiveDirection(
      getNavDirection(),
      prevPathRef.current,
      location.pathname
    );
    prevPathRef.current = location.pathname;
    setNavDirection("none");
  }

  useEffect(() => {
    const handler = () => {
      scrollMapRef.current[location.pathname] = window.scrollY;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [location.pathname]);

  useEffect(() => {
    if (isTabRoot(location.pathname)) {
      const saved = scrollMapRef.current[location.pathname] || 0;
      const t = setTimeout(() => window.scrollTo(0, saved), 280);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const direction = directionRef.current;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="min-h-screen"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}