// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export function DriftGauge({ level }) {
  const levels = {
    optimal: { rotation: -60, color: "#10b981", label: "Optimal", emoji: "✅" },
    watch: { rotation: -20, color: "#fbbf24", label: "Watch", emoji: "👀" },
    concern: { rotation: 20, color: "#f97316", label: "Concern", emoji: "⚠️" },
    critical: {
      rotation: 60,
      color: "#ef4444",
      label: "Critical",
      emoji: "🚨",
    },
  };

  const current = levels[level];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24">
        {/* Gauge background */}
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Colored segments */}
          <path
            d="M 20 90 A 80 80 0 0 1 60 35"
            fill="none"
            stroke="#10b981"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 60 35 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 100 20 A 80 80 0 0 1 140 35"
            fill="none"
            stroke="#f97316"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 140 35 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#ef4444"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Center point */}
          <circle cx="100" cy="90" r="8" fill="#374151" />

          {/* Needle */}
          <motion.line
            initial={{ rotate: -60 }}
            animate={{ rotate: current.rotation }}
            transition={{ duration: 1, ease: "easeOut" }}
            x1="100"
            y1="90"
            x2="100"
            y2="30"
            stroke={current.color}
            strokeWidth="4"
            strokeLinecap="round"
            style={{ originX: "100px", originY: "90px" }}
          />
        </svg>
      </div>

      {/* Label */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-2xl">{current.emoji}</span>
        <div>
          <div
            className="text-lg font-semibold"
            style={{ color: current.color }}
          >
            {current.label}
          </div>
          <div className="text-sm text-gray-600">Drift Level</div>
        </div>
      </div>
    </div>
  );
}
