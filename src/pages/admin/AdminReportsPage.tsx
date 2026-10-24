import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Card, PageSpinner } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import {
  contactApi,
  type ContactMessage,
  type ContactCategory,
  type ContactStatus,
  type ContactUrgency,
} from "@/lib/api/contact";
import { useToast } from "@/context/ToastContext";

interface ReportData {
  avgAwareness: number;
  avgQuiz: number;
  avgSimulation: number;
  completionRate: number;
}

export function AdminReportsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"desk" | "analytics">("desk");
  const [report, setReport] = useState<ReportData | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [profiles, quizResults, simResults, progress, contactMsgs] = await Promise.all([
        supabase.from("profiles").select("awareness_score"),
        supabase.from("quiz_results").select("score, total_questions"),
        supabase.from("simulation_results").select("score"),
        supabase.from("progress").select("is_completed"),
        contactApi.getAllMessages(),
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
      setMessages(contactMsgs);
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ContactStatus) => {
    try {
      await contactApi.updateStatus(id, newStatus);
      const updated = await contactApi.getAllMessages();
      setMessages(updated);
      toast({ title: `Ticket status updated to ${newStatus}`, variant: "success" });
    } catch {
      toast({ title: "Failed to update status", variant: "error" });
    }
  };

  const handleSaveNote = async (id: string) => {
    try {
      await contactApi.updateStatus(id, messages.find((m) => m.id === id)?.status || "reviewed", tempNote);
      const updated = await contactApi.getAllMessages();
      setMessages(updated);
      setEditingNoteId(null);
      setTempNote("");
      toast({ title: "Admin note saved", variant: "success" });
    } catch {
      toast({ title: "Failed to save note", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to dismiss and delete this report?")) return;
    try {
      await contactApi.deleteMessage(id);
      const updated = await contactApi.getAllMessages();
      setMessages(updated);
      toast({ title: "Report removed from desk", variant: "info" });
    } catch {
      toast({ title: "Failed to delete message", variant: "error" });
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchCat = selectedCategory === "all" || m.category === selectedCategory;
      const matchStatus = selectedStatus === "all" || m.status === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.subject.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q);
      return matchCat && matchStatus && matchSearch;
    });
  }, [messages, selectedCategory, selectedStatus, searchQuery]);

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const bugCount = messages.filter((m) => m.category === "bug").length;
  const suggestionCount = messages.filter((m) => m.category === "suggestion").length;
  const vulnCount = messages.filter((m) => m.category === "vulnerability").length;

  if (loading && !report) return <PageSpinner />;

  const getCategoryBadge = (cat: ContactCategory) => {
    switch (cat) {
      case "bug":
        return { label: "Bug Report", icon: "ti-bug", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "suggestion":
        return { label: "Suggestion", icon: "ti-bulb", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" };
      case "vulnerability":
        return { label: "Security Flaw", icon: "ti-shield-alert", color: "bg-danger/10 text-danger border-danger/20" };
      case "inquiry":
      default:
        return { label: "General", icon: "ti-message-circle", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    }
  };

  const getUrgencyBadge = (urg: ContactUrgency) => {
    switch (urg) {
      case "critical":
        return "bg-danger/15 text-danger border-danger/30";
      case "high":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "medium":
        return "bg-primary/15 text-primary border-primary/30";
      case "low":
      default:
        return "bg-surface-elevated text-text-fog border-border";
    }
  };

  const getStatusBadge = (status: ContactStatus) => {
    switch (status) {
      case "unread":
        return { label: "Unread", color: "bg-danger/10 text-danger border-danger/25" };
      case "reviewed":
        return { label: "Reviewed", color: "bg-amber-500/10 text-amber-500 border-amber-500/25" };
      case "in-progress":
        return { label: "In Progress", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25" };
      case "resolved":
        return { label: "Resolved", color: "bg-success/10 text-success border-success/25" };
    }
  };

  const cards = [
    { label: "Average Awareness Score", value: `${report?.avgAwareness ?? 0}/100` },
    { label: "Average Quiz Score", value: `${report?.avgQuiz ?? 0}%` },
    { label: "Average Simulation Score", value: `${report?.avgSimulation ?? 0}%` },
    { label: "Course Completion Rate", value: `${report?.completionRate ?? 0}%` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-pure">Incident & Feedback Desk</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-fog">
            Admin oversight: review user bug submissions, community suggestions, and platform aggregate metrics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-border bg-surface-elevated p-1">
          <button
            type="button"
            onClick={() => setActiveTab("desk")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "desk"
                ? "bg-surface text-text-pure shadow-sm border border-border"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-inbox" />
            Contact & Bugs ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-surface text-text-pure shadow-sm border border-border"
                : "text-text-fog hover:text-text-pure"
            }`}
          >
            <i className="ti ti-chart-bar" />
            Platform Analytics
          </button>
        </div>
      </div>

      {activeTab === "desk" ? (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[11px] font-medium text-text-fog">Unread Submissions</span>
              <div className="text-xl font-bold text-danger mt-0.5">{unreadCount}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[11px] font-medium text-text-fog">Bug Reports</span>
              <div className="text-xl font-bold text-amber-500 mt-0.5">{bugCount}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[11px] font-medium text-text-fog">Suggestions</span>
              <div className="text-xl font-bold text-cyan-400 mt-0.5">{suggestionCount}</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <span className="text-[11px] font-medium text-text-fog">Security Disclosures</span>
              <div className="text-xl font-bold text-primary mt-0.5">{vulnCount}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="rounded-xl border border-border bg-surface p-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-text-ash text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket ID, sender name, email, or keywords..."
                  className="input pl-8 py-1.5 text-xs w-full"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-text-ash text-[11px]">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input py-1 px-2 text-xs bg-surface-elevated"
                >
                  <option value="all">All Statuses</option>
                  <option value="unread">Unread</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50">
              <span className="text-[11px] text-text-ash mr-1">Category:</span>
              {[
                { id: "all", label: "All Items" },
                { id: "bug", label: "🐛 Bugs" },
                { id: "suggestion", label: "💡 Suggestions" },
                { id: "vulnerability", label: "🛡️ Flaws & Scams" },
                { id: "inquiry", label: "💬 Inquiries" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-primary text-text-pure"
                      : "bg-surface-elevated border border-border text-text-fog hover:text-text-pure"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-text-fog">
                <i className="ti ti-inbox-off text-3xl mb-2 text-text-ash inline-block" />
                <p className="text-sm font-medium">No contact submissions match the current filters.</p>
                <p className="text-xs text-text-ash mt-1">Try resetting the search query or status filter.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const catBadge = getCategoryBadge(msg.category);
                const statusBadge = getStatusBadge(msg.status);
                const isEditingNote = editingNoteId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`rounded-xl border p-4 transition-all bg-surface ${
                      msg.status === "unread" ? "border-primary/40 shadow-sm" : "border-border"
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-text-pure bg-surface-elevated px-2 py-0.5 rounded border border-border">
                          {msg.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${catBadge.color}`}
                        >
                          <i className={`ti ${catBadge.icon}`} />
                          {catBadge.label}
                        </span>
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${getUrgencyBadge(
                            msg.urgency
                          )}`}
                        >
                          {msg.urgency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusBadge.color}`}
                        >
                          {statusBadge.label}
                        </span>
                        <span className="text-[11px] text-text-ash">
                          {new Date(msg.created_at).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Sender & Subject */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-text-pure">{msg.subject}</h3>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-text-fog">
                        <span className="font-medium text-text-pure">{msg.name}</span>
                        <span>•</span>
                        <a
                          href={`mailto:${msg.email}?subject=Re: [${msg.id}] ${encodeURIComponent(msg.subject)}`}
                          className="text-primary hover:underline"
                        >
                          {msg.email}
                        </a>
                      </div>
                    </div>

                    {/* Content Box */}
                    <div className="mt-3 rounded-lg bg-surface-elevated/70 border border-border/60 p-3 text-xs text-text-pure leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    {/* Admin Notes Section */}
                    {msg.admin_notes && !isEditingNote && (
                      <div className="mt-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 p-2.5 text-xs text-text-fog flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-amber-500 text-[10px] uppercase tracking-wider block">
                            Admin Triage Note:
                          </span>
                          <span className="mt-0.5 text-text-pure">{msg.admin_notes}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(msg.id);
                            setTempNote(msg.admin_notes || "");
                          }}
                          className="text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {isEditingNote && (
                      <div className="mt-2.5 space-y-2">
                        <textarea
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Add internal administrator notes for resolution or follow-up..."
                          rows={2}
                          className="input w-full text-xs"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => {
                              setEditingNoteId(null);
                              setTempNote("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size="xs" variant="primary" onClick={() => handleSaveNote(msg.id)}>
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="mt-3.5 pt-2.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-text-ash mr-1">Set Status:</span>
                        {(["unread", "reviewed", "in-progress", "resolved"] as ContactStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(msg.id, st)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize transition-colors cursor-pointer ${
                              msg.status === st
                                ? "bg-primary text-text-pure"
                                : "bg-surface-elevated border border-border text-text-fog hover:text-text-pure"
                            }`}
                          >
                            {st.replace("-", " ")}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {!msg.admin_notes && !isEditingNote && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(msg.id);
                              setTempNote("");
                            }}
                            className="text-[11px] text-text-fog hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <i className="ti ti-notes" />
                            Add Note
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(msg.id)}
                          className="text-[11px] text-danger hover:underline cursor-pointer flex items-center gap-1"
                          title="Delete report"
                        >
                          <i className="ti ti-trash" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Analytics Tab */
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <Card key={c.label}>
                <div className="text-2xl font-bold text-primary">{c.value}</div>
                <div className="mt-1 text-xs text-text-fog">{c.label}</div>
              </Card>
            ))}
          </div>
          <Card>
            <h3 className="text-sm font-semibold text-text-pure">Operational Status</h3>
            <p className="mt-1 text-xs text-text-fog leading-relaxed">
              Platform telemetry is streaming from Supabase real-time instances.
              Course completions, score distribution, and live simulation outcomes are evaluated
              against community defense baselines.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
