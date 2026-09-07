import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageSpinner, EmptyState, Pill } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import type { Module, Lesson, LessonBlock } from "@/types";
import { useToast } from "@/context/ToastContext";

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

type DraftBlock = LessonBlock & { _id: string };

const blockLabels: Record<LessonBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  list: "Bulleted list",
  tip: "Security tip",
  warning: "Warning",
  image: "Image",
  case_study: "Case Study",
  interactive_check: "Concept Check",
  terminal: "Terminal / Code",
  takeaway: "Golden Rule / Takeaway",
};

function emptyBlock(type: LessonBlock["type"]): DraftBlock {
  switch (type) {
    case "heading":
      return { _id: uid(), type, text: "" };
    case "paragraph":
      return { _id: uid(), type, text: "" };
    case "tip":
      return { _id: uid(), type, text: "" };
    case "warning":
      return { _id: uid(), type, text: "" };
    case "list":
      return { _id: uid(), type, items: [""] };
    case "image":
      return { _id: uid(), type, url: "", caption: "" };
    case "case_study":
      return { _id: uid(), type, title: "", incident: "", impact: "", takeaway: "" };
    case "interactive_check":
      return { _id: uid(), type, question: "", options: [{ text: "", correct: true, explanation: "" }] };
    case "terminal":
      return { _id: uid(), type, title: "", command: "", output: "" };
    case "takeaway":
      return { _id: uid(), type, title: "Golden Rules", points: [""] };
  }
}

function BlockEditor({ block, onChange, onRemove }: { block: DraftBlock; onChange: (b: DraftBlock) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-faint">{blockLabels[block.type]}</span>
        <button onClick={onRemove} className="text-text-faint hover:text-danger">
          <i className="ti ti-trash text-sm" />
        </button>
      </div>

      <div className="mt-2">
        {(block.type === "heading" || block.type === "paragraph" || block.type === "tip" || block.type === "warning") && (
          <textarea
            rows={block.type === "paragraph" ? 3 : 2}
            placeholder="Text..."
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            className="input"
          />
        )}

        {block.type === "list" && (
          <div className="space-y-2">
            {block.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(e) => {
                    const items = [...block.items];
                    items[i] = e.target.value;
                    onChange({ ...block, items });
                  }}
                  placeholder={`Item ${i + 1}`}
                  className="input"
                />
                {block.items.length > 1 && (
                  <button
                    onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
                    className="text-text-faint hover:text-danger"
                  >
                    <i className="ti ti-x" />
                  </button>
                )}
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...block, items: [...block.items, ""] })}>
              + Add item
            </Button>
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-2">
            <input placeholder="Image URL" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} className="input" />
            <input placeholder="Caption (optional)" value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} className="input" />
          </div>
        )}

        {block.type === "case_study" && (
          <div className="space-y-2">
            <input placeholder="Case Study Title" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input" />
            <textarea rows={2} placeholder="Incident description..." value={block.incident} onChange={(e) => onChange({ ...block, incident: e.target.value })} className="input" />
            <textarea rows={2} placeholder="Impact / Damage..." value={block.impact} onChange={(e) => onChange({ ...block, impact: e.target.value })} className="input" />
            <textarea rows={2} placeholder="Takeaway / Fix..." value={block.takeaway} onChange={(e) => onChange({ ...block, takeaway: e.target.value })} className="input" />
          </div>
        )}

        {block.type === "interactive_check" && (
          <div className="space-y-2">
            <input placeholder="Question prompt..." value={block.question} onChange={(e) => onChange({ ...block, question: e.target.value })} className="input" />
            <p className="text-xs text-text-dim">Micro-check question with immediate feedback.</p>
          </div>
        )}

        {block.type === "terminal" && (
          <div className="space-y-2">
            <input placeholder="Terminal Title / Header" value={block.title ?? ""} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input" />
            <input placeholder="Command executed (optional)" value={block.command ?? ""} onChange={(e) => onChange({ ...block, command: e.target.value })} className="input font-mono text-xs" />
            <textarea rows={3} placeholder="Console Output / Logs..." value={block.output} onChange={(e) => onChange({ ...block, output: e.target.value })} className="input font-mono text-xs" />
          </div>
        )}

        {block.type === "takeaway" && (
          <div className="space-y-2">
            <input placeholder="Takeaway Card Title" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} className="input" />
            {block.points.map((pt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={pt}
                  onChange={(e) => {
                    const points = [...block.points];
                    points[i] = e.target.value;
                    onChange({ ...block, points });
                  }}
                  placeholder={`Takeaway ${i + 1}`}
                  className="input"
                />
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...block, points: [...block.points, ""] })}>
              + Add Takeaway
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLessonsPage() {
  const toast = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<DraftBlock[]>([emptyBlock("paragraph")]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("modules").select("*").order("order_index").then(({ data }) => {
      setModules((data ?? []) as Module[]);
      if (data?.length) setModuleId(data[0].id);
    });
  }, []);

  const loadLessons = async (id: string) => {
    const { data } = await supabase.from("lessons").select("*").eq("module_id", id).order("order_index");
    setLessons(data as Lesson[]);
  };

  useEffect(() => {
    if (moduleId) loadLessons(moduleId);
  }, [moduleId]);

  const addBlock = (type: LessonBlock["type"]) => setBlocks((prev) => [...prev, emptyBlock(type)]);
  const updateBlock = (id: string, next: DraftBlock) => setBlocks((prev) => prev.map((b) => (b._id === id ? next : b)));
  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b._id !== id));

  const resetForm = () => {
    setTitle("");
    setBlocks([emptyBlock("paragraph")]);
    setError(null);
  };

  const addLesson = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Give the lesson a title.");
      return;
    }
    const cleaned = blocks
      .map(({ _id, ...rest }) => { void _id; return rest as LessonBlock; })
      .filter((b) => {
        if (b.type === "list") return b.items.some((i) => i.trim());
        if (b.type === "image") return Boolean(b.url.trim());
        if (b.type === "case_study") return Boolean(b.title.trim() || b.incident.trim());
        if (b.type === "interactive_check") return Boolean(b.question.trim());
        if (b.type === "terminal") return Boolean(b.output.trim());
        if (b.type === "takeaway") return b.points.some((p) => p.trim());
        return Boolean(b.text.trim());
      });

    if (!cleaned.length) {
      setError("Add at least one block of content.");
      return;
    }

    const { error: insertError } = await supabase.from("lessons").insert({
      module_id: moduleId,
      title,
      content: cleaned,
      order_index: (lessons?.length ?? 0) + 1,
    });
    if (insertError) {
      setError(`Failed to save lesson: ${insertError.message}`);
      return;
    }
    resetForm();
    loadLessons(moduleId);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      toast({ title: `Failed to delete lesson: ${error.message}`, variant: "error" });
      return;
    }
    loadLessons(moduleId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Lessons</h1>
        <p className="mt-1 text-sm text-text-dim">Build lessons block by block. They appear instantly in the lesson reader.</p>
      </div>

      <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="input max-w-sm">
        {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
      </select>

      <Card>
        <h3 className="text-sm font-semibold text-text">Add lesson</h3>
        <div className="mt-3 space-y-3">
          <input placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />

          <div className="space-y-2.5">
            {blocks.map((b) => (
              <BlockEditor key={b._id} block={b} onChange={(next) => updateBlock(b._id, next)} onRemove={() => removeBlock(b._id)} />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(blockLabels) as LessonBlock["type"][]).map((type) => (
              <Button key={type} size="sm" variant="secondary" onClick={() => addBlock(type)}>
                + {blockLabels[type]}
              </Button>
            ))}
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
          <Button size="sm" onClick={addLesson}>Add Lesson</Button>
        </div>
      </Card>

      {!lessons ? <PageSpinner /> : !lessons.length ? (
        <EmptyState title="No lessons yet" description="Add the first lesson for this module above." />
      ) : (
        <div className="space-y-2">
          {lessons.map((l) => (
            <Card key={l.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text">{l.title}</span>
                <Pill>{l.content.length} block{l.content.length === 1 ? "" : "s"}</Pill>
              </div>
              <Button size="sm" variant="danger" onClick={() => deleteLesson(l.id)}>Delete</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
