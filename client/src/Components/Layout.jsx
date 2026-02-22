import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMe } from "../hooks/use-auth";

import { Heart, Home, User, Stethoscope, Bot, Loader2 } from "lucide-react";

import { Navbar } from "./Navbar";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user, isLoading } = useMe();

  const isPublicRoute = ["/", "/login", "/signup"].includes(location.pathname);

  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const authenticated = !!user;
  const onboarded = user ? !user.isFirstLogin : false;
  // Navigation only shows for logged-in users who finished onboarding and aren't on the landing page
  const showNav = authenticated && onboarded && !isPublicRoute;

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-blue-50">
      {showNav && <Navbar />}
      <main className={showNav ? "pt-24 pb-20" : ""}>
        <Outlet />
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-50">
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
