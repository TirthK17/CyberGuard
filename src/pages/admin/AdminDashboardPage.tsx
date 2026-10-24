import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { StatCard, SkeletonCard, SectionHeader } from "@/components/ui/primitives";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalQuizzes: number;
  totalSimulations: number;
  avgScore: number;
}

interface ScoreBucket {
  range: string;
  count: number;
}

interface UserGrowthPoint {
  month: string;
  users: number;
}

const SCORE_BUCKETS: ScoreBucket[] = [
  { range: "0–20",  count: 0 },
  { range: "21–40", count: 0 },
  { range: "41–60", count: 0 },
  { range: "61–80", count: 0 },
  { range: "81–100",count: 0 },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreBucket[]>(SCORE_BUCKETS);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>([]);

  useEffect(() => {
    (async () => {
      const [users, active, courses, quizzes, sims, scoreAgg, profileDates] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("modules").select("id", { count: "exact", head: true }),
        supabase.from("quizzes").select("id", { count: "exact", head: true }),
        supabase.from("simulations").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("awareness_score"),
        supabase.from("profiles").select("created_at"),
      ]);

      // Stats
      const scores = (scoreAgg.data ?? []).map((r) => r.awareness_score as number);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      setStats({
        totalUsers: users.count ?? 0,
        activeUsers: active.count ?? 0,
        totalCourses: courses.count ?? 0,
        totalQuizzes: quizzes.count ?? 0,
        totalSimulations: sims.count ?? 0,
        avgScore: avg,
      });

      // Score distribution
      const buckets = [...SCORE_BUCKETS.map((b) => ({ ...b }))];
      for (const s of scores) {
        if (s <= 20)       buckets[0].count++;
        else if (s <= 40)  buckets[1].count++;
        else if (s <= 60)  buckets[2].count++;
        else if (s <= 80)  buckets[3].count++;
        else               buckets[4].count++;
      }
      setScoreDistribution(buckets);

      // User growth (last 6 months from registration dates)
      const now = new Date();
      const months: UserGrowthPoint[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: d.toLocaleDateString(undefined, { month: "short" }),
          users: 0,
        });
      }
      for (const row of (profileDates.data ?? []) as { created_at: string }[]) {
        const d = new Date(row.created_at);
        const label = d.toLocaleDateString(undefined, { month: "short" });
        const match = months.find((m) => m.month === label);
        if (match) match.users++;
      }
      // Cumulative
      let cumulative = 0;
      setUserGrowth(
        months.map((m) => {
          cumulative += m.users;
          return { ...m, users: cumulative };
        })
      );
    })();
  }, []);

  const statCards = stats
    ? [
        { icon: "ti-users",           label: "Registered Operators", value: stats.totalUsers,       tone: "violet"  as const },
        { icon: "ti-user-check",      label: "Active Sessions",      value: stats.activeUsers,      tone: "success" as const },
        { icon: "ti-book-2",          label: "Curriculum Courses",   value: stats.totalCourses,     tone: "default" as const },
        { icon: "ti-clipboard-check", label: "Verification Quizzes", value: stats.totalQuizzes,     tone: "cyan"    as const },
        { icon: "ti-flask",           label: "Live Simulations",     value: stats.totalSimulations, tone: "lime"    as const },
        { icon: "ti-gauge",           label: "Mean Defense Index",   value: stats.avgScore,         tone: stats.avgScore >= 61 ? "success" as const : "warn" as const },
      ]
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="eyebrow text-frost-glow">Administration &amp; Telemetry</p>
        <h1 className="gradient-heading mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Console
        </h1>
        <p className="mt-1 text-xs text-text-fog">
          Platform-wide operator metrics, curriculum inventory, and score telemetry.
        </p>
      </motion.div>

      {/* Stat cards */}
      {!statCards ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <StatCard icon={c.icon} label={c.label} value={c.value} tone={c.tone} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User growth */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Operator Growth" description="Cumulative platform registrations over the last 6 months." />
          <div className="mt-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-void-violet)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-void-violet)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-glass-edge)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-text-ash)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-ash)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-glass-edge-strong)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--color-text-pure)",
                  }}
                  cursor={{ stroke: "var(--color-void-violet)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--color-void-violet)"
                  strokeWidth={2}
                  fill="url(#userGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score distribution */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader title="Index Distribution" description="Operator defense scores distributed across brackets." />
          <div className="mt-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} barCategoryGap="28%">
                <CartesianGrid stroke="var(--color-glass-edge)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fill: "var(--color-text-ash)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-ash)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-obsidian)",
                    border: "1px solid var(--color-glass-edge-strong)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--color-text-pure)",
                  }}
                  cursor={{ fill: "rgba(186, 215, 247, 0.04)" }}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={44}>
                  {scoreDistribution.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.range.startsWith("81") ? "var(--color-success)" :
                        entry.range.startsWith("61") ? "var(--color-void-violet)" :
                        entry.range.startsWith("41") ? "var(--color-warn)" :
                        "var(--color-danger)"
                      }
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick links to admin sections */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader title="Console Shortcuts" description="Direct access to operational management panels." />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: "/admin/users",       label: "Manage Operators",     icon: "ti-users" },
            { to: "/admin/courses",     label: "Manage Curriculum",    icon: "ti-book-2" },
            { to: "/admin/quizzes",     label: "Manage Quizzes",       icon: "ti-clipboard-check" },
            { to: "/admin/reports",     label: "Feedback & Bug Desk",  icon: "ti-inbox" },
          ].map((item) => (
            <Link key={item.to} to={item.to}>
              <div className="flex items-center gap-3 rounded-xl border border-glass-edge bg-carbon p-3.5 text-xs text-text-fog transition-all duration-150 hover:border-glass-edge-strong hover:text-text-pure hover:bg-obsidian">
                <i className={`ti ${item.icon} text-base text-frost-glow`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
