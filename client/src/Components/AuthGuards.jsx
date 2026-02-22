import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../hooks/use-auth";
import { isAuthenticated } from "../lib/storage";
import { Loader2 } from "lucide-react";

// ─── Shared loading spinner ───────────────────────────────────────────────────

function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
    </div>
  );
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
//
// Guards pages that require:
//   1. An active session  (isAuthenticated cookie hint + confirmed by /profile)
//   2. Completed onboarding  (user.isOnboarded === true)
//
// Flow:
//   • If the `is_logged_in` hint cookie is absent  → immediate redirect to /login
//     (no network request needed)
//   • If the cookie is present but useMe is still loading → show spinner
//   • If useMe resolves with no user (token expired, server returned 401) → /login
//   • If user exists but hasn't onboarded → /onboarding
//   • Otherwise → render children

export function ProtectedRoute({ children }) {
  const location = useLocation();

  // Fast path: no session hint → skip the API call entirely
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <ProtectedRouteInner location={location}>{children}</ProtectedRouteInner>
  );
}

// Inner component: only rendered when isAuthenticated() is true, so useMe
// will always have a valid cookie to work with.
function ProtectedRouteInner({ children, location }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <AuthLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

// ─── OnboardingRoute ──────────────────────────────────────────────────────────
//
// Accessible only to authenticated users who have NOT yet completed onboarding.
// Already-onboarded users are redirected straight to the dashboard.

export function OnboardingRoute({ children }) {
  // Fast path: no session hint → must login first
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <OnboardingRouteInner>{children}</OnboardingRouteInner>;
}

function OnboardingRouteInner({ children }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) return <AuthLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ─── GuestRoute ───────────────────────────────────────────────────────────────
//
// Pages that should only be visible to unauthenticated users (login, signup).
// If a session cookie exists, the user is redirected to the dashboard.

export function GuestRoute({ children }) {
  // Fast path: active session detected → skip the API round-trip
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <GuestRouteInner>{children}</GuestRouteInner>;
}

function GuestRouteInner({ children }) {
  const { data: user, isLoading } = useMe();

  // While loading (edge case: cookie present but cleared between renders), wait
  if (isLoading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
