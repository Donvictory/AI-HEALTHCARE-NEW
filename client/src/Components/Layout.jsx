import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  isAuthenticated,
  hasCompletedOnboarding,
  getTodaysCheckIn,
} from "../lib/storage";

import { Heart, Home, User, Stethoscope, Bot } from "lucide-react";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const authenticated = isAuthenticated();
  const onboarded = hasCompletedOnboarding();
  const todayCheckIn = getTodaysCheckIn();

  const publicRoutes = ["/", "/login", "/signup"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    if (!authenticated && !isPublicRoute) {
      navigate("/login");
    } else if (
      authenticated &&
      !onboarded &&
      location.pathname !== "/onboarding"
    ) {
      navigate("/onboarding");
    } else if (
      authenticated &&
      onboarded &&
      (location.pathname === "/" || location.pathname === "/login")
    ) {
      if (!todayCheckIn) {
        navigate("/check-in");
      } else {
        navigate("/dashboard");
      }
    }
  }, [
    navigate,
    location.pathname,
    authenticated,
    onboarded,
    isPublicRoute,
    todayCheckIn,
  ]);

  const showNav = authenticated && onboarded && !isPublicRoute;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Outlet />

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
            <NavButton
              icon={<Home size={24} />}
              label="Home"
              active={location.pathname === "/dashboard"}
              onClick={() => navigate("/dashboard")}
            />
            <NavButton
              icon={<Heart size={24} />}
              label="Check-in"
              active={location.pathname === "/check-in"}
              onClick={() => navigate("/check-in")}
            />
            <NavButton
              icon={<Bot size={24} />}
              label="AI Chat"
              active={location.pathname === "/health-chat"}
              onClick={() => navigate("/health-chat")}
            />
            <NavButton
              icon={<Stethoscope size={24} />}
              label="Doctors"
              active={location.pathname === "/find-doctor"}
              onClick={() => navigate("/find-doctor")}
            />
            <NavButton
              icon={<User size={24} />}
              label="Profile"
              active={location.pathname === "/profile"}
              onClick={() => navigate("/profile")}
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? "text-emerald-600" : "text-gray-500"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
