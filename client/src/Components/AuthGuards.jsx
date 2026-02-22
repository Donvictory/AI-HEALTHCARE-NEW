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

<<<<<<< HEAD
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // if (!user) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  if (!user?.isOnboarded && location.pathname !== "/onboarding") {
=======
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Simple onboarding redirect if we have the hint
  if (!isOnboarded() && location.pathname !== "/onboarding") {
>>>>>>> b37a01891f9b74d2edc5a98f4c400035a6261c92
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
<<<<<<< HEAD
  const { data: user, isLoading } = useMe();

  console.log(user);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  if (user?.isOnboarded) {
=======
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isOnboarded()) {
>>>>>>> b37a01891f9b74d2edc5a98f4c400035a6261c92
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
