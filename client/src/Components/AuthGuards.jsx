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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isOnboarded && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

/**
 * OnboardingRoute: Specifically for the onboarding flow.
 * Requires auth, but redirects to dashboard if already onboarded.
 */
export function OnboardingRoute({ children }) {
  const { data: user, isLoading } = useMe();

  console.log(user);

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

/**
 * GuestRoute: For Login/Signup pages.
 * Redirects authenticated users to dashboard.
 */
export function GuestRoute({ children }) {
  const { data: user, isLoading } = useMe();

  if (isLoading) return null; // No loader for guest routes for smoother feel

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
