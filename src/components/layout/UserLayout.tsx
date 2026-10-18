import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/RouteGuards";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { OnboardingTour } from "@/components/OnboardingTour";
import { userNav } from "@/lib/navigation";

export function UserLayout() {
  return (
    <ProtectedRoute>
      <DashboardShell navItems={userNav} brandLabel="CyberGuard">
        <Outlet />
      </DashboardShell>
      <OnboardingTour />
    </ProtectedRoute>
  );
}
