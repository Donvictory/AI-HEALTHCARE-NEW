import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, isOnboarded } from "../lib/storage";
import { useMe } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * ─── ProtectedRoute ──────────────────────────────────────────────────────────
 *
 * Guards pages that require an active session.
 */
export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { data: user, isLoading } = useMe();

  // 1. If Loading, show a spinner to avoid unauthorized flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // 2. If no user and we are not loading, redirect to login
  if (!user && !isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If authenticated but not onboarded, force onboarding (unless already there)
  const userIsOnboarded = user?.isOnboarded ?? isOnboarded();
  if (!isLoading && !userIsOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/**
 * ─── OnboardingRoute ─────────────────────────────────────────────────────────
 *
 * Accessible only to authenticated users who haven't onboarded yet.
 */
export function OnboardingRoute({ children }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  const userIsOnboarded = user?.isOnboarded ?? isOnboarded();
  if (userIsOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * ─── GuestRoute ──────────────────────────────────────────────────────────────
 *
 * Pages for unauthenticated users (Login, Signup).
 * Redirects to dashboard if already logged in.
 */
export function GuestRoute({ children }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return null; // Silent check
  }

  // CRITICAL FIX: Only redirect to dashboard if the 'user' object is actually present.
  // This prevents an infinite loop where the 'is_logged_in' cookie exists but
  // the session is invalid (so the Layout redirects to /login, but this guard
  // would normally redirect back to /dashboard).
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
