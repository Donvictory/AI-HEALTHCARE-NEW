import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, isOnboarded } from "../lib/storage";

/**
 * ─── Simple ProtectedRoute ──────────────────────────────────────────────────────────
 *
 * Guards pages that require an active session.
 * Uses a non-httpOnly hint cookie (is_logged_in) set by the server.
 * Does NOT fetch user details to keep navigation instant.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Simple onboarding redirect if we have the hint
  if (!isOnboarded() && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/**
 * ─── Simple OnboardingRoute ─────────────────────────────────────────────────────────
 *
 * Accessible only to authenticated users who haven't onboarded yet.
 */
export function OnboardingRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isOnboarded()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * ─── Simple GuestRoute ──────────────────────────────────────────────────────────────
 *
 * Pages for unauthenticated users (Login, Signup).
 * Redirects to dashboard if already logged in.
 */
export function GuestRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
