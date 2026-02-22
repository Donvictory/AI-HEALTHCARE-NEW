import { useNavigate } from "react-router-dom";
import {
  Activity,
  Shield,
  TrendingUp,
  Heart,
  ArrowRight,
  Sparkles,
  Award,
  Smartphone,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../Components/ui/button";

export function LandingPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm rounded-full px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-xl shadow-lg shadow-emerald-100">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900">
              DRIFT<span className="text-emerald-600">CARE</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-lg shadow-emerald-100"
            >
              Join DriftCare
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
              Nigeria's #1 Preventive Health Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter mb-8 leading-[0.9]"
          >
            Predict Your Health <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
              Before It Drifts.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            A next-gen health monitoring system designed for the modern
            Nigerian. DriftCare uses biometric analysis to detect subtle health
            changes before they become emergencies.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate("/signup")}
              className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-10 py-8 rounded-3xl text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-gray-200"
            >
              Start Your Journey
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full md:w-auto px-10 py-8 rounded-3xl text-xl font-bold bg-white border-2 border-gray-100 hover:bg-gray-50 transition-all hover:scale-105"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-emerald-50/50 border border-emerald-100"
            >
              <div className="bg-white p-4 rounded-2xl w-fit shadow-sm mb-6 text-emerald-600">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                Drift Detection
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Our proprietary algorithm analyzes your daily check-ins to
                detect subtle "drifts" in your health baseline.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-blue-50/50 border border-blue-100"
            >
              <div className="bg-white p-4 rounded-2xl w-fit shadow-sm mb-6 text-blue-600">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                Sovereign Privacy
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Your health data is yours alone. We use local-first encryption
                to ensure your records never leave your control.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[3rem] bg-purple-50/50 border border-purple-100"
            >
              <div className="bg-white p-4 rounded-2xl w-fit shadow-sm mb-6 text-purple-600">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                Health Rewards
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                Consistency pays off. Earn points for every check-in and unlock
                exclusive HMO discounts and health perks.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-8 italic">
                "We're building the infrastructure for a healthier Nigeria."
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-gray-700">
                    Real-time Biometric Tracking
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-gray-700">
                    Verified Doctor Finder (Coming Soon)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm border border-emerald-100">
                    <Lock className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-gray-700 uppercase tracking-widest text-emerald-600">
                    Secure & Confidential
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 blur-[100px] opacity-30 animate-pulse" />
              <div className="relative bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      Resilience Score
                    </p>
                    <p className="text-4xl font-black text-emerald-600">88.4</p>
                  </div>
                  <Activity className="w-10 h-10 text-emerald-100" />
                </div>
                <div className="h-40 w-full bg-emerald-50 rounded-2xl flex items-end p-4 gap-2">
                  {[40, 60, 45, 90, 75, 88].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className="flex-1 bg-emerald-400 rounded-lg"
                    />
                  ))}
                </div>
                <div className="mt-8 p-4 bg-emerald-600 rounded-2xl text-white">
                  <p className="text-sm font-bold italic">
                    "Pattern analysis suggests high recovery resilience. Keep up
                    current hydration levels."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span className="text-xl font-black tracking-tighter text-gray-900">
              DRIFTCARE
            </span>
          </div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
            © 2026 DriftCare NG. For Nigeran health, by Nigerian tech.
          </p>
          <div className="flex items-center gap-6">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <Heart className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}
