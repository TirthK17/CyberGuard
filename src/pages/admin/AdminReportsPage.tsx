import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageSpinner } from "@/components/ui/primitives";

interface ReportData {
  avgAwareness: number;
  avgQuiz: number;
  avgSimulation: number;
  completionRate: number;
}

export function AdminReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    (async () => {
      const [profiles, quizResults, simResults, progress, modules] = await Promise.all([
        supabase.from("profiles").select("awareness_score"),
        supabase.from("quiz_results").select("score, total_questions"),
        supabase.from("simulation_results").select("score"),
        supabase.from("progress").select("is_completed"),
        supabase.from("modules").select("id", { count: "exact", head: true }),
      ]);

      const scores = (profiles.data ?? []).map((p) => p.awareness_score as number);
      const avgAwareness = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      const quizPcts = (quizResults.data ?? []).map((r) => (r.score / r.total_questions) * 100);
      const avgQuiz = quizPcts.length ? Math.round(quizPcts.reduce((a, b) => a + b, 0) / quizPcts.length) : 0;

      const simScores = (simResults.data ?? []).map((r) => r.score as number);
      const avgSimulation = simScores.length ? Math.round(simScores.reduce((a, b) => a + b, 0) / simScores.length) : 0;

      const completedCount = (progress.data ?? []).filter((p) => p.is_completed).length;
      const totalProgress = progress.data?.length ?? 0;
      const completionRate = totalProgress ? Math.round((completedCount / totalProgress) * 100) : 0;

      setReport({ avgAwareness, avgQuiz, avgSimulation, completionRate });
      void modules;
    })();
  }, []);

  if (!report) return <PageSpinner />;

  const cards = [
    { label: "Average Awareness Score", value: `${report.avgAwareness}/100` },
    { label: "Average Quiz Score", value: `${report.avgQuiz}%` },
    { label: "Average Simulation Score", value: `${report.avgSimulation}%` },
    { label: "Course Completion Rate", value: `${report.completionRate}%` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Reports</h1>
        <p className="mt-1 text-sm text-text-dim">Aggregate performance across the platform.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <div className="text-2xl font-bold text-cyan">{c.value}</div>
            <div className="mt-1 text-xs text-text-faint">{c.label}</div>
          </Card>
        ))}
      </div>
      <Card>
        <p className="text-sm text-text-dim">
          TODO: most difficult module, most successful module, most-failed quiz, and most popular
          simulation require larger sample sizes — add these once there's enough activity data
          to make the rankings meaningful.
        </p>
      </Card>
    </div>
  );
}
