import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <Outlet />
      <BottomNav />
    </div>
  );
}