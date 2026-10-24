import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { UserLayout } from "@/components/layout/UserLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { CommandPalette } from "@/components/CommandPalette";
import { ShortcutsModal } from "@/components/ui/ShortcutsModal";
import { CelebrationModal } from "@/components/ui/CelebrationModal";
import { PageSpinner } from "@/components/ui/primitives";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { isSupabaseConfigured } from "@/lib/supabase";
import { MissingEnvScreen } from "@/components/ui/MissingEnvScreen";

// ── CODE-SPLIT PAGE IMPORTS ──────────────────────────────────────────────────
const LandingPage = lazy(() => import("@/pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import("@/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const AboutPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.AboutPage })));
const FeaturesPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.FeaturesPage })));
const TopicsPage = lazy(() => import("@/pages/TopicsPage").then((m) => ({ default: m.TopicsPage })));
const HowItWorksPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.HowItWorksPage })));
const ContactPage = lazy(() => import("@/pages/StaticPages").then((m) => ({ default: m.ContactPage })));

const UserDashboardPage = lazy(() => import("@/pages/UserDashboardPage").then((m) => ({ default: m.UserDashboardPage })));
const TrainingPage = lazy(() => import("@/pages/TrainingPage").then((m) => ({ default: m.TrainingPage })));
const ModuleDetailPage = lazy(() => import("@/pages/ModuleDetailPage").then((m) => ({ default: m.ModuleDetailPage })));
const QuizzesPage = lazy(() => import("@/pages/QuizzesPage").then((m) => ({ default: m.QuizzesPage })));
const QuizTakingPage = lazy(() => import("@/pages/QuizTakingPage").then((m) => ({ default: m.QuizTakingPage })));
const SimulationsPage = lazy(() => import("@/pages/SimulationsPage").then((m) => ({ default: m.SimulationsPage })));
const SimulationPlayerPage = lazy(() => import("@/pages/SimulationPlayerPage").then((m) => ({ default: m.SimulationPlayerPage })));
const AssessmentPage = lazy(() => import("@/pages/AssessmentPage").then((m) => ({ default: m.AssessmentPage })));
const SecurityToolsPage = lazy(() => import("@/pages/SecurityToolsPage").then((m) => ({ default: m.SecurityToolsPage })));
const ReportIncidentPage = lazy(() => import("@/pages/ReportIncidentPage").then((m) => ({ default: m.ReportIncidentPage })));
const ThreatIntelligencePage = lazy(() => import("@/pages/ThreatIntelligencePage").then((m) => ({ default: m.ThreatIntelligencePage })));
const ProgressPage = lazy(() => import("@/pages/ProgressPage").then((m) => ({ default: m.ProgressPage })));
const BadgesPage = lazy(() => import("@/pages/BadgesPage").then((m) => ({ default: m.BadgesPage })));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage").then((m) => ({ default: m.LeaderboardPage })));
const CertificatePage = lazy(() => import("@/pages/CertificatePage").then((m) => ({ default: m.CertificatePage })));
const GlossaryPage = lazy(() => import("@/pages/GlossaryPage").then((m) => ({ default: m.GlossaryPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const VerifyCertificatePage = lazy(() => import("@/pages/VerifyCertificatePage").then((m) => ({ default: m.VerifyCertificatePage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage })));
const AdminCoursesPage = lazy(() => import("@/pages/admin/AdminCoursesPage").then((m) => ({ default: m.AdminCoursesPage })));
const AdminLessonsPage = lazy(() => import("@/pages/admin/AdminLessonsPage").then((m) => ({ default: m.AdminLessonsPage })));
const AdminQuizzesPage = lazy(() => import("@/pages/admin/AdminQuizzesPage").then((m) => ({ default: m.AdminQuizzesPage })));
const AdminSimulationsPage = lazy(() => import("@/pages/admin/AdminSimulationsPage").then((m) => ({ default: m.AdminSimulationsPage })));
const AdminBadgesPage = lazy(() => import("@/pages/admin/AdminBadgesPage").then((m) => ({ default: m.AdminBadgesPage })));
const AdminReportsPage = lazy(() => import("@/pages/admin/AdminReportsPage").then((m) => ({ default: m.AdminReportsPage })));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })));

function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-pure">
      <PublicNavbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      <PublicFooter />
    </div>
  );
}

function App() {
  if (!isSupabaseConfigured) {
    return <MissingEnvScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AccessibilityProvider>
            <AuthProvider>
              <ToastProvider>
                <BrowserRouter>
                <div id="app-root-container">
                  <CommandPalette />
                  <ShortcutsModal />
                  <CelebrationModal />
                  <Suspense fallback={<PageSpinner />}>
                    <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
                  <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                  <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
                  <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
                  <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                  <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                  <Route path="/admin/login" element={<PublicLayout><LoginPage defaultAdmin={true} /></PublicLayout>} />
                  <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
                  <Route path="/verify/:certId" element={<VerifyCertificatePage />} />

                  {/* User Console Layout Routes (no remounting) */}
                  <Route element={<UserLayout />}>
                    <Route path="/dashboard" element={<UserDashboardPage />} />
                    <Route path="/training" element={<TrainingPage />} />
                    <Route path="/training/:slug" element={<ModuleDetailPage />} />
                    <Route path="/simulations" element={<SimulationsPage />} />
                    <Route path="/simulations/:slug" element={<SimulationPlayerPage />} />
                    <Route path="/tools" element={<SecurityToolsPage />} />
                    <Route path="/report" element={<ReportIncidentPage />} />
                    <Route path="/assessment" element={<AssessmentPage />} />
                    <Route path="/quizzes" element={<QuizzesPage />} />
                    <Route path="/quizzes/:id" element={<QuizTakingPage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/badges" element={<BadgesPage />} />
                    <Route path="/certificate" element={<CertificatePage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/threats" element={<ThreatIntelligencePage />} />
                    <Route path="/guide" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/glossary" element={<GlossaryPage />} />
                    <Route path="/topics" element={<TopicsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>

                  {/* Admin Console Layout Routes (no remounting) */}
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboardPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route path="/admin/courses" element={<AdminCoursesPage />} />
                    <Route path="/admin/lessons" element={<AdminLessonsPage />} />
                    <Route path="/admin/quizzes" element={<AdminQuizzesPage />} />
                    <Route path="/admin/simulations" element={<AdminSimulationsPage />} />
                    <Route path="/admin/badges" element={<AdminBadgesPage />} />
                    <Route path="/admin/reports" element={<AdminReportsPage />} />
                    <Route path="/admin/settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* 404 Catch-All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </AccessibilityProvider>
  </ThemeProvider>
</QueryClientProvider>
</ErrorBoundary>
  );
}

export default App;
