import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, Pill, PageSpinner } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/types";
import { useToast } from "@/context/ToastContext";

export function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data as Profile[]);
  };

  useEffect(() => {
    load();
  }, []);

  if (!users) return <PageSpinner />;

  const toggleStatus = async (u: Profile) => {
    const newStatus = u.status === "active" ? "disabled" : "active";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", u.id);
    if (error) {
      toast({ title: `Failed to update status: ${error.message}`, variant: "error" });
      return;
    }
    load();
  };

  const toggleRole = async (u: Profile) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    const verb = newRole === "admin" ? "make this user an admin" : "remove admin access from this user";
    if (!confirm(`Are you sure you want to ${verb}? (${u.email})`)) return;
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    if (error) {
      toast({ title: `Failed to update role: ${error.message}`, variant: "error" });
      return;
    }
    load();
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Users</h1>
        <p className="mt-1 text-sm text-text-dim">Manage learner and admin accounts.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="min-w-[220px] flex-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text outline-none focus:border-cyan/50"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none">
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-faint">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-text">{u.full_name}</td>
                <td className="px-5 py-3 text-text-dim">{u.email}</td>
                <td className="px-5 py-3"><Pill tone={u.role === "admin" ? "cyan" : "default"}>{u.role}</Pill></td>
                <td className="px-5 py-3 text-text-dim">{u.awareness_score}</td>
                <td className="px-5 py-3"><Pill tone={u.status === "active" ? "success" : "danger"}>{u.status}</Pill></td>
                <td className="px-5 py-3 text-text-faint">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toggleStatus(u)}>
                      {u.status === "active" ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant={u.role === "admin" ? "danger" : "secondary"} onClick={() => toggleRole(u)}>
                      {u.role === "admin" ? "Remove admin" : "Make admin"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
