export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export const userNav: NavItem[] = [
  { to: "/dashboard",   label: "Dashboard",           icon: "ti-layout-dashboard" },
  { to: "/training",    label: "Academy Lessons",     icon: "ti-book-2" },
  { to: "/simulations", label: "Threat Sandboxes",    icon: "ti-target" },
  { to: "/quizzes",     label: "Practice Quizzes",    icon: "ti-help" },
  { to: "/assessment",  label: "Safety Assessment",   icon: "ti-certificate" },
  { to: "/topics",      label: "Knowledge Topics",    icon: "ti-bookmarks" },
  { to: "/tools",       label: "Defense Tools",       icon: "ti-tools" },
  { to: "/threats",     label: "Threat Intelligence", icon: "ti-radar" },
  { to: "/report",      label: "Incident Response",   icon: "ti-flag" },
  { to: "/progress",    label: "My Progress",         icon: "ti-chart-line" },
  { to: "/badges",      label: "Badges & Ranks",      icon: "ti-award" },
  { to: "/leaderboard", label: "Leaderboard",         icon: "ti-trophy" },
  { to: "/certificate", label: "Certificate",         icon: "ti-file-certificate" },
  { to: "/guide",       label: "Safety Playbook",     icon: "ti-shield" },
  { to: "/glossary",    label: "Glossary",            icon: "ti-vocabulary" },
  { to: "/profile",     label: "Profile",             icon: "ti-user" },
  { to: "/settings",    label: "Settings",            icon: "ti-settings" },
];

export const adminNav: NavItem[] = [
  { to: "/admin",             label: "Overview",       icon: "ti-layout-dashboard" },
  { to: "/admin/users",       label: "Learners",       icon: "ti-users" },
  { to: "/admin/courses",     label: "Courses",        icon: "ti-book-2" },
  { to: "/admin/lessons",     label: "Lessons",        icon: "ti-notebook" },
  { to: "/admin/quizzes",     label: "Quizzes",        icon: "ti-help" },
  { to: "/admin/simulations", label: "Simulations",    icon: "ti-target" },
  { to: "/admin/badges",      label: "Badges",         icon: "ti-award" },
  { to: "/admin/reports",     label: "Incident Desk",  icon: "ti-alert-circle" },
  { to: "/admin/settings",    label: "System Settings",icon: "ti-settings" },
];
