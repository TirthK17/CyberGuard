import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProtectedRoute, AdminRoute } from "@/components/layout/RouteGuards";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { DashboardShell, type NavItem } from "@/components/layout/DashboardShell";
import { CommandPalette } from "@/components/CommandPalette";

import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AboutPage, FeaturesPage, TopicsPage, HowItWorksPage, ContactPage } from "@/pages/StaticPages";

import { UserDashboardPage } from "@/pages/UserDashboardPage";
import { TrainingPage } from "@/pages/TrainingPage";
import { ModuleDetailPage } from "@/pages/ModuleDetailPage";
import { QuizzesPage } from "@/pages/QuizzesPage";
import { QuizTakingPage } from "@/pages/QuizTakingPage";
import { SimulationsPage } from "@/pages/SimulationsPage";
import { SimulationPlayerPage } from "@/pages/SimulationPlayerPage";
import { AssessmentPage } from "@/pages/AssessmentPage";
import { SecurityToolsPage } from "@/pages/SecurityToolsPage";
import { ReportIncidentPage } from "@/pages/ReportIncidentPage";
import { ThreatIntelligencePage } from "@/pages/ThreatIntelligencePage";
import { ProgressPage } from "@/pages/ProgressPage";
import { BadgesPage } from "@/pages/BadgesPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { CertificatePage } from "@/pages/CertificatePage";
import { SecurityGuidePage } from "@/pages/SecurityGuidePage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { SettingsPage } from "@/pages/SettingsPage";

import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminCoursesPage } from "@/pages/admin/AdminCoursesPage";
import { AdminLessonsPage } from "@/pages/admin/AdminLessonsPage";
import { AdminQuizzesPage } from "@/pages/admin/AdminQuizzesPage";
import { AdminSimulationsPage } from "@/pages/admin/AdminSimulationsPage";
import { AdminBadgesPage } from "@/pages/admin/AdminBadgesPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import { AdminSettingsPage } from "@/pages/admin/AdminSettingsPage";

/* Real-Life Cyber Defense Navigation */
const userNav: NavItem[] = [
  { to: "/dashboard",   label: "Defense Center",      icon: "ti-shield-check" },
  { to: "/training",    label: "Training Academy",    icon: "ti-book-2" },
  { to: "/simulations", label: "Threat Sandboxes",    icon: "ti-target" },
  { to: "/topics",      label: "Awareness Topics",    icon: "ti-bookmarks" },
  { to: "/tools",       label: "Security Toolkit",    icon: "ti-tools" },
  { to: "/threats",     label: "Live Threat Radar",   icon: "ti-radar" },
  { to: "/assessment",  label: "Assessments",         icon: "ti-certificate" },
  { to: "/report",      label: "Report Incident",     icon: "ti-flag" },
  { to: "/leaderboard", label: "Rankings & Badges",   icon: "ti-trophy" },
  { to: "/settings",    label: "Settings",            icon: "ti-settings" },
];

const adminNav: NavItem[] = [
  { to: "/admin",             label: "Dashboard",   icon: "ti-layout-dashboard" },
  { to: "/admin/users",       label: "Users",       icon: "ti-users" },
  { to: "/admin/courses",     label: "Courses",     icon: "ti-book-2" },
  { to: "/admin/reports",     label: "Reports",     icon: "ti-chart-bar" },
  { to: "/admin/settings",    label: "Settings",    icon: "ti-settings" },
];

function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <>
      <PublicNavbar />
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
    </>
  );
}

function TopicsWrapper() {
  const { user } = useAuth();
  if (user) {
    return (
      <ProtectedRoute>
        <DashboardShell navItems={userNav} brandLabel="Defense Console">
          <TopicsPage />
        </DashboardShell>
      </ProtectedRoute>
    );
  }
  return (
    <PublicLayout>
      <TopicsPage />
    </PublicLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <CommandPalette />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
              <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
              <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
              <Route path="/topics" element={<TopicsWrapper />} />
              <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
              <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

              {/* User Console */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><UserDashboardPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/training" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><TrainingPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/training/:slug" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><ModuleDetailPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/simulations" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><SimulationsPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/simulations/:slug" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><SimulationPlayerPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/tools" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><SecurityToolsPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><ReportIncidentPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><AssessmentPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/quizzes" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><QuizzesPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/quizzes/:id" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><QuizTakingPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><LeaderboardPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/badges" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><BadgesPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/certificate" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><CertificatePage /></DashboardShell></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><ProgressPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/threats" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><ThreatIntelligencePage /></DashboardShell></ProtectedRoute>} />
              <Route path="/guide" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><SecurityGuidePage /></DashboardShell></ProtectedRoute>} />
              <Route path="/glossary" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><GlossaryPage /></DashboardShell></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><ProfilePage /></DashboardShell></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><DashboardShell navItems={userNav} brandLabel="Defense Console"><SettingsPage /></DashboardShell></ProtectedRoute>} />

              {/* Admin Console */}
              <Route path="/admin" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminDashboardPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminUsersPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/courses" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminCoursesPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/lessons" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminLessonsPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/quizzes" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminQuizzesPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/simulations" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminSimulationsPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/badges" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminBadgesPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminReportsPage /></DashboardShell></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><DashboardShell navItems={adminNav} brandLabel="Admin Console"><AdminSettingsPage /></DashboardShell></AdminRoute>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
