import { Navigate } from "react-router-dom";

export function BadgesPage() {
  return <Navigate to="/leaderboard?tab=badges" replace />;
}
