import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageSpinner } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Badge } from "@/types";
import { useToast } from "@/context/ToastContext";

export function AdminBadgesPage() {
  const toast = useToast();
  const [badges, setBadges] = useState<Badge[] | null>(null);
  const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("ti-award");
  const [reqType, setReqType] = useState("module_complete");
  const [reqValue, setReqValue] = useState(1);

  const load = async () => {
    const { data } = await supabase.from("badges").select("*");
    setBadges(data as Badge[]);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const { error } = await supabase.from("badges").insert({ name, description, icon, requirement_type: reqType, requirement_value: reqValue });
    if (error) {
      toast({ title: `Failed to create badge: ${error.message}`, variant: "error" });
      return;
    }
    setName("");
    setDescription("");
    load();
  };

  const handleConfirmDelete = async () => {
    if (!badgeToDelete) return;
    const id = badgeToDelete.id;
    setBadgeToDelete(null);
    const { error } = await supabase.from("badges").delete().eq("id", id);
    if (error) {
      toast({ title: `Failed to delete badge: ${error.message}`, variant: "error" });
      return;
    }
    toast({ title: "Badge deleted", variant: "info" });
    load();
  };

  if (!badges) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Badges</h1>
        <p className="mt-1 text-sm text-text-dim">Define achievement badges and what unlocks them.</p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-text">Create badge</h3>
        <div className="mt-3 space-y-3">
          <input placeholder="Badge name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          <input placeholder="Description / requirement" value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
          <div className="grid grid-cols-3 gap-2">
            <input placeholder="Icon (e.g. ti-award)" value={icon} onChange={(e) => setIcon(e.target.value)} className="input" />
            <select value={reqType} onChange={(e) => setReqType(e.target.value)} className="input">
              <option value="module_complete">Module complete</option>
              <option value="module_count">Module count</option>
              <option value="simulation_category_count">Simulation category count</option>
              <option value="assessment_score">Assessment score</option>
            </select>
            <input type="number" placeholder="Value" value={reqValue} onChange={(e) => setReqValue(Number(e.target.value))} className="input" />
          </div>
          <Button size="sm" onClick={create} disabled={!name}>Create Badge</Button>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <Card key={b.id}>
            <i className={`ti ${b.icon} text-xl text-cyan`} />
            <h3 className="mt-3 text-sm font-semibold text-text">{b.name}</h3>
            <p className="mt-1 text-xs text-text-dim">{b.description}</p>
            <Button size="sm" variant="danger" className="mt-3" onClick={() => setBadgeToDelete(b)}>Delete</Button>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(badgeToDelete)}
        title="Delete Badge"
        message={`Are you sure you want to delete badge "${badgeToDelete?.name}"? Users who unlocked this badge will lose it from their profile.`}
        confirmLabel="Delete Badge"
        cancelLabel="Cancel"
        confirmTone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setBadgeToDelete(null)}
      />
    </div>
  );
}
