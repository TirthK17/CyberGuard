import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Card, Pill, PageSpinner } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Module, Difficulty } from "@/types";
import { useToast } from "@/context/ToastContext";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  difficulty: "beginner" as Difficulty,
  duration_minutes: 15,
  learning_objectives: "",
};

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function AdminCoursesPage() {
  const toast = useToast();
  const [modules, setModules] = useState<Module[] | null>(null);
  const [editing, setEditing] = useState<Module | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("modules").select("*").order("order_index");
    setModules(data as Module[]);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (m: Module) => {
    setEditing(m);
    setForm({
      title: m.title,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      duration_minutes: m.duration_minutes,
      learning_objectives: m.learning_objectives.join("\n"),
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      slug: editing ? editing.slug : slugify(form.title),
      description: form.description,
      category: form.category,
      difficulty: form.difficulty,
      duration_minutes: Number(form.duration_minutes),
      learning_objectives: form.learning_objectives.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    if (editing) {
      const { error } = await supabase.from("modules").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: `Failed to save course: ${error.message}`, variant: "error" });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("modules").insert({ ...payload, is_published: false, order_index: (modules?.length ?? 0) + 1 });
      if (error) {
        toast({ title: `Failed to create course: ${error.message}`, variant: "error" });
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setFormOpen(false);
    load();
  };

  const togglePublish = async (m: Module) => {
    const { error } = await supabase.from("modules").update({ is_published: !m.is_published }).eq("id", m.id);
    if (error) {
      toast({ title: `Failed to update publish state: ${error.message}`, variant: "error" });
      return;
    }
    load();
  };

  const handleDelete = (m: Module) => {
    setModuleToDelete(m);
  };

  const handleConfirmDelete = async () => {
    if (!moduleToDelete) return;
    const m = moduleToDelete;
    setModuleToDelete(null);
    const { error } = await supabase.from("modules").delete().eq("id", m.id);
    if (error) {
      toast({ title: `Failed to delete course: ${error.message}`, variant: "error" });
      return;
    }
    toast({ title: `Course "${m.title}" deleted`, variant: "info" });
    load();
  };

  if (!modules) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Courses</h1>
          <p className="mt-1 text-sm text-text-dim">Create modules — they appear on the Training page automatically once published.</p>
        </div>
        <Button onClick={openCreate} icon={<i className="ti ti-plus" />}>New Course</Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-faint">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Difficulty</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 font-medium text-text">{m.title}</td>
                <td className="px-5 py-3 text-text-dim">{m.category}</td>
                <td className="px-5 py-3 text-text-dim">{m.difficulty}</td>
                <td className="px-5 py-3">
                  <Pill tone={m.is_published ? "success" : "default"}>{m.is_published ? "Published" : "Draft"}</Pill>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => togglePublish(m)}>
                      {m.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(m)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <Card className="w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-text">{editing ? "Edit Course" : "New Course"}</h2>
            <div className="mt-4 space-y-3">
              <Field label="Title">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" />
                </Field>
                <Field label="Difficulty">
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })} className="input">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </Field>
              </div>
              <Field label="Duration (minutes)">
                <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="input" />
              </Field>
              <Field label="Learning objectives (one per line)">
                <textarea rows={3} value={form.learning_objectives} onChange={(e) => setForm({ ...form, learning_objectives: e.target.value })} className="input" />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.title}>{saving ? "Saving..." : "Save Course"}</Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(moduleToDelete)}
        title="Delete Course Module"
        message={`Are you sure you want to delete course module "${moduleToDelete?.title}"? All lessons associated with this module will also be deleted.`}
        confirmLabel="Delete Module"
        cancelLabel="Cancel"
        confirmTone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setModuleToDelete(null)}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-dim">{label}</label>
      {children}
    </div>
  );
}
