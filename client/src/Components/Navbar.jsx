import { useNavigate, useLocation } from "react-router-dom";
import { Activity, Bell, Settings } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/5 rounded-3xl px-6 py-3 flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative">
              <div className="bg-emerald-600 p-1.5 rounded-2xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/logo.svg"
                  alt="DriftCare Logo"
                  className="w-6 h-6 invert brightness-0"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">
                DRIFT<span className="text-emerald-600">CARE</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">
                Next-Gen Health
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation Hints (Optional, can be expanded) */}
          <div className="hidden md:flex items-center gap-8">
            {["Dashboard", "Health Tank", "Insights"].map((item) => (
              <button
                key={item}
                className="text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-widest"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="p-2.5 rounded-2xl bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-white shadow-md cursor-pointer overflow-hidden flex items-center justify-center hover:scale-105 transition-transform"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
