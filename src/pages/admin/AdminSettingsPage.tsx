import { Card } from "@/components/ui/primitives";

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-dim">Platform-wide configuration.</p>
      </div>
      <Card>
        <p className="text-sm text-text-dim">
          TODO: platform-level settings (branding, email templates, points values, level
          thresholds) will live here. For now these are configured directly in the database
          (see supabase/seed.sql).
        </p>
      </Card>
    </div>
  );
}
