import { Outlet } from "react-router-dom";
import { AdminRoute } from "@/components/layout/RouteGuards";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/navigation";

export function AdminLayout() {
  return (
    <AdminRoute>
      <DashboardShell navItems={adminNav} brandLabel="Admin Console">
        <Outlet />
      </DashboardShell>
    </AdminRoute>
  );
}
