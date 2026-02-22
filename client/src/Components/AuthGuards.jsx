import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * ProtectedRoute: For pages requiring authentication AND onboarding completion.
 */
export function ProtectedRoute({ children }) {
  const { data: user, isLoading } = useMe();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Proactive check to see if we even have a session cookie
    const hasSession = document.cookie.includes("logged_in=true");
    if (!hasSession) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    // If we have a session cookie but no user yet (and not loading),
    // it likely means the session is invalid or the API call failed.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export function OnboardingRoute({ children }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) return null;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
