import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, Pill, PageSpinner } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import type { Simulation, SimulationStep, SimulationStepOption } from "@/types";
import { useToast } from "@/context/ToastContext";

function slugify(t: string) {
  return t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function uid() {
  return Math.random().toString(36).slice(2, 8);
}

const emptyOption = (): SimulationStepOption => ({ id: uid(), label: "", correct: false });

export function AdminSimulationsPage() {
  const toast = useToast();
  const [sims, setSims] = useState<Simulation[] | null>(null);
  const [selected, setSelected] = useState<Simulation | null>(null);
  const [steps, setSteps] = useState<SimulationStep[] | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("phishing");
  const [scenario, setScenario] = useState("");

  const [prompt, setPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<SimulationStepOption[]>([emptyOption(), emptyOption()]);
  const [stepError, setStepError] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("simulations").select("*").order("created_at", { ascending: false });
    setSims(data as Simulation[]);
  };

  useEffect(() => {
    load();
  }, []);

  const loadSteps = async (sim: Simulation) => {
    setSelected(sim);
    const { data } = await supabase.from("simulation_steps").select("*").eq("simulation_id", sim.id).order("order_index");
    setSteps(data as SimulationStep[]);
  };

  const create = async () => {
    const { error } = await supabase.from("simulations").insert({
      title,
      slug: slugify(title),
      category,
      description: scenario,
      scenario,
      is_published: false,
    });
    if (error) {
      toast({ title: `Failed to create simulation: ${error.message}`, variant: "error" });
      return;
    }
    setTitle("");
    setScenario("");
    load();
  };

  const togglePublish = async (s: Simulation) => {
    const { error } = await supabase.from("simulations").update({ is_published: !s.is_published }).eq("id", s.id);
    if (error) {
      toast({ title: `Failed to update publish state: ${error.message}`, variant: "error" });
      return;
    }
    load();
    if (selected?.id === s.id) setSelected({ ...s, is_published: !s.is_published });
  };

  const remove = async (s: Simulation) => {
    if (!confirm(`Delete "${s.title}"? This also removes its steps.`)) return;
    const { error } = await supabase.from("simulations").delete().eq("id", s.id);
    if (error) {
      toast({ title: `Failed to delete simulation: ${error.message}`, variant: "error" });
      return;
    }
    if (selected?.id === s.id) {
      setSelected(null);
      setSteps(null);
    }
    load();
  };

  const updateOption = (id: string, patch: Partial<SimulationStepOption>) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const setCorrectOption = (id: string) => {
    setOptions((prev) => prev.map((o) => ({ ...o, correct: o.id === id })));
  };

  const addOption = () => setOptions((prev) => [...prev, emptyOption()]);
  const removeOption = (id: string) => setOptions((prev) => prev.filter((o) => o.id !== id));

  const resetStepForm = () => {
    setPrompt("");
    setExplanation("");
    setOptions([emptyOption(), emptyOption()]);
    setStepError(null);
  };

  const addStep = async () => {
    if (!selected) return;
    setStepError(null);
    if (!prompt.trim()) {
      setStepError("Add a prompt for this step.");
      return;
    }
    if (options.some((o) => !o.label.trim())) {
      setStepError("Every option needs a label.");
      return;
    }
    if (!options.some((o) => o.correct)) {
      setStepError("Mark one option as correct.");
      return;
    }

    const { error } = await supabase.from("simulation_steps").insert({
      simulation_id: selected.id,
      order_index: (steps?.length ?? 0) + 1,
      prompt,
      options,
      explanation,
    });
    if (error) {
      setStepError(`Failed to save step: ${error.message}`);
      return;
    }
    resetStepForm();
    loadSteps(selected);
  };

  const deleteStep = async (id: string) => {
    if (!selected) return;
    const { error } = await supabase.from("simulation_steps").delete().eq("id", id);
    if (error) {
      toast({ title: `Failed to delete step: ${error.message}`, variant: "error" });
      return;
    }
    loadSteps(selected);
  };

  if (!sims) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Simulations</h1>
        <p className="mt-1 text-sm text-text-dim">Create simulations, then build their step-by-step decision flow below.</p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-text">Create simulation</h3>
        <div className="mt-3 space-y-3">
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input max-w-xs">
            <option value="wifi">Public Wi-Fi</option>
            <option value="phishing">Phishing</option>
            <option value="social_engineering">Social Engineering</option>
            <option value="ransomware">Ransomware</option>
          </select>
          <textarea placeholder="Scenario description" rows={2} value={scenario} onChange={(e) => setScenario(e.target.value)} className="input" />
          <Button size="sm" onClick={create} disabled={!title}>Create Simulation</Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 self-start">
          {sims.map((s) => (
            <Card
              key={s.id}
              className={`flex items-center justify-between py-3 cursor-pointer ${selected?.id === s.id ? "border-cyan/40" : ""}`}
              onClick={() => loadSteps(s)}
            >
              <div>
                <span className="text-sm font-medium text-text">{s.title}</span>{" "}
                <Pill tone={s.is_published ? "success" : "default"}>{s.is_published ? "Published" : "Draft"}</Pill>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="secondary" onClick={() => togglePublish(s)}>{s.is_published ? "Unpublish" : "Publish"}</Button>
                <Button size="sm" variant="danger" onClick={() => remove(s)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>

        {selected && (
          <Card>
            <h3 className="text-sm font-semibold text-text">Steps — {selected.title}</h3>

            <div className="mt-3 space-y-2">
              {steps?.map((st, i) => (
                <div key={st.id} className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-text"><span className="text-text-faint">{i + 1}.</span> {st.prompt}</span>
                    <Button size="sm" variant="danger" onClick={() => deleteStep(st.id)}>Delete</Button>
                  </div>
                  <ul className="mt-1.5 space-y-0.5 pl-4 text-xs text-text-faint">
                    {st.options.map((o) => (
                      <li key={o.id} className={o.correct ? "text-success" : ""}>
                        {o.correct ? "✓ " : "• "}{o.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {steps && steps.length === 0 && (
                <p className="text-xs text-text-faint">No steps yet — add the first decision point below.</p>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-text-faint">Add step</h4>
              <textarea placeholder="Prompt / question for this step" rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="input" />

              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrectOption(opt.id)}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                        opt.correct ? "border-success bg-success/20 text-success" : "border-border text-text-faint"
                      }`}
                      title="Mark as correct"
                    >
                      {opt.correct ? "✓" : ""}
                    </button>
                    <input
                      placeholder={`Option ${i + 1}`}
                      value={opt.label}
                      onChange={(e) => updateOption(opt.id, { label: e.target.value })}
                      className="input"
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(opt.id)} className="text-text-faint hover:text-danger">
                        <i className="ti ti-x" />
                      </button>
                    )}
                  </div>
                ))}
                <Button size="sm" variant="ghost" onClick={addOption}>+ Add option</Button>
              </div>

              <textarea placeholder="Explanation shown after the user chooses" rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} className="input" />

              {stepError && <p className="text-xs text-danger">{stepError}</p>}
              <Button size="sm" onClick={addStep}>Add Step</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
