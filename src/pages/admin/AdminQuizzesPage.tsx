import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, Pill, PageSpinner } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import type { Quiz, Question, Module } from "@/types";
import { useToast } from "@/context/ToastContext";

export function AdminQuizzesPage() {
  const toast = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selected, setSelected] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [qForm, setQForm] = useState({ question: "", a: "", b: "", c: "", d: "", correct: "a" as "a" | "b" | "c" | "d", explanation: "" });

  const loadQuizzes = async () => {
    const { data } = await supabase.from("quizzes").select("*").order("created_at", { ascending: false });
    setQuizzes(data as Quiz[]);
  };

  useEffect(() => {
    loadQuizzes();
    supabase.from("modules").select("*").then(({ data }) => setModules((data ?? []) as Module[]));
  }, []);

  const loadQuestions = async (quiz: Quiz) => {
    setSelected(quiz);
    const { data } = await supabase.from("questions").select("*").eq("quiz_id", quiz.id).order("order_index");
    setQuestions(data as Question[]);
  };

  const createQuiz = async () => {
    const { error } = await supabase.from("quizzes").insert({ title: newTitle, category: newCategory, is_published: false });
    if (error) {
      toast({ title: `Failed to create quiz: ${error.message}`, variant: "error" });
      return;
    }
    setNewTitle("");
    setNewCategory("");
    loadQuizzes();
  };

  const togglePublish = async (q: Quiz) => {
    const { error } = await supabase.from("quizzes").update({ is_published: !q.is_published }).eq("id", q.id);
    if (error) {
      toast({ title: `Failed to update publish state: ${error.message}`, variant: "error" });
      return;
    }
    loadQuizzes();
  };

  const deleteQuiz = async (q: Quiz) => {
    if (!confirm(`Delete "${q.title}"?`)) return;
    const { error } = await supabase.from("quizzes").delete().eq("id", q.id);
    if (error) {
      toast({ title: `Failed to delete quiz: ${error.message}`, variant: "error" });
      return;
    }
    if (selected?.id === q.id) setSelected(null);
    loadQuizzes();
  };

  const addQuestion = async () => {
    if (!selected) return;
    const { error } = await supabase.from("questions").insert({
      quiz_id: selected.id,
      question: qForm.question,
      option_a: qForm.a,
      option_b: qForm.b,
      option_c: qForm.c,
      option_d: qForm.d,
      correct_answer: qForm.correct,
      explanation: qForm.explanation,
      order_index: (questions?.length ?? 0) + 1,
    });
    if (error) {
      toast({ title: `Failed to add question: ${error.message}`, variant: "error" });
      return;
    }
    setQForm({ question: "", a: "", b: "", c: "", d: "", correct: "a", explanation: "" });
    loadQuestions(selected);
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase.from("questions").delete().eq("id", id);
    if (error) {
      toast({ title: `Failed to delete question: ${error.message}`, variant: "error" });
      return;
    }
    if (selected) loadQuestions(selected);
  };

  if (!quizzes) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Quizzes & Questions</h1>
        <p className="mt-1 text-sm text-text-dim">Manage quizzes and add unlimited questions to each one.</p>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-text">Create quiz</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <input placeholder="Quiz title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="input max-w-xs" />
          <input placeholder="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input max-w-xs" />
          <Button size="sm" onClick={createQuiz} disabled={!newTitle}>Create</Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0 overflow-hidden self-start">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-faint">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className={`border-b border-border last:border-0 cursor-pointer ${selected?.id === q.id ? "bg-cyan/5" : ""}`} onClick={() => loadQuestions(q)}>
                  <td className="px-4 py-3 text-text">{q.title}</td>
                  <td className="px-4 py-3"><Pill tone={q.is_published ? "success" : "default"}>{q.is_published ? "Published" : "Draft"}</Pill></td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => togglePublish(q)}>{q.is_published ? "Unpublish" : "Publish"}</Button>
                      <Button size="sm" variant="danger" onClick={() => deleteQuiz(q)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {selected && (
          <Card>
            <h3 className="text-sm font-semibold text-text">Questions — {selected.title}</h3>
            <div className="mt-3 space-y-2">
              {questions?.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
                  <span className="text-text">{q.question}</span>
                  <Button size="sm" variant="danger" onClick={() => deleteQuestion(q.id)}>Delete</Button>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-border pt-4">
              <input placeholder="Question" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} className="input" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Option A" value={qForm.a} onChange={(e) => setQForm({ ...qForm, a: e.target.value })} className="input" />
                <input placeholder="Option B" value={qForm.b} onChange={(e) => setQForm({ ...qForm, b: e.target.value })} className="input" />
                <input placeholder="Option C" value={qForm.c} onChange={(e) => setQForm({ ...qForm, c: e.target.value })} className="input" />
                <input placeholder="Option D" value={qForm.d} onChange={(e) => setQForm({ ...qForm, d: e.target.value })} className="input" />
              </div>
              <div className="flex gap-2">
                <select value={qForm.correct} onChange={(e) => setQForm({ ...qForm, correct: e.target.value as "a" | "b" | "c" | "d" })} className="input max-w-[120px]">
                  <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                </select>
                <input placeholder="Explanation" value={qForm.explanation} onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })} className="input" />
              </div>
              <Button size="sm" onClick={addQuestion} disabled={!qForm.question}>Add Question</Button>
            </div>
          </Card>
        )}
      </div>
      {modules.length === 0 && null}
    </div>
  );
}
