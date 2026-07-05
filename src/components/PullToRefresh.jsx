import { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, ChevronDown } from "lucide-react";

const THRESHOLD = 70;
const MAX_PULL = 100;

export default function PullToRefresh({ onRefresh, children, className }) {
  const containerRef = useRef(null);
  const startY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || refreshing) return;
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || refreshing) return;
    const el = containerRef.current;
    if (!el) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && el.scrollTop === 0) {
      if (e.cancelable) e.preventDefault();
      const distance = Math.min(diff * 0.5, MAX_PULL);
      setPullDistance(distance);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh();
      } catch (e) {
        console.error(e);
      }
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const showIndicator = pullDistance > 0 || refreshing;
  const progress = Math.min(pullDistance / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className={`relative ${className || ""}`}
      style={{ overscrollBehaviorY: "none" }}
    >
      {showIndicator && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 z-50 flex items-center justify-center"
          style={{ height: `${pullDistance}px` }}
        >
          {refreshing ? (
            <Loader2 size={24} className="animate-spin text-white/70" />
          ) : (
            <ChevronDown
              size={24}
              className="text-white/70 transition-transform duration-200"
              style={{ transform: `rotate(180deg) scale(${progress})` }}
            />
          )}
        </div>
      )}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pulling.current ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}