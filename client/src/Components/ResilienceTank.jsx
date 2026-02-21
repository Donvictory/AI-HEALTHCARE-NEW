// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export function ResilienceTank({ score, size = "medium" }) {
  const sizes = {
    small: { width: 80, height: 120 },
    medium: { width: 120, height: 180 },
    large: { width: 160, height: 240 },
  };

  const { width, height } = sizes[size];
  const fillHeight = (score / 100) * (height - 20);

  // Color based on score
  const getColor = (score) => {
    if (score >= 75) return "#10b981"; // green
    if (score >= 60) return "#fbbf24"; // yellow
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative border-4 border-gray-800 rounded-lg overflow-hidden"
        style={{ width, height }}
      >
        {/* Tank fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: fillHeight }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0"
          style={{
            backgroundColor: color,
            opacity: 0.8,
          }}
        />

        {/* Gradient overlay for liquid effect */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: fillHeight }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: `linear-gradient(to top, ${color}dd, ${color}44)`,
          }}
        />

        {/* Wave animation on top */}
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-0 right-0 h-3"
          style={{
            bottom: fillHeight - 10,
            background: `linear-gradient(to bottom, ${color}ff, transparent)`,
            filter: "blur(2px)",
          }}
        />

        {/* Scale markings */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
          {[100, 75, 50, 25, 0].map((mark) => (
            <div key={mark} className="flex items-center justify-end">
              <div className="h-px w-3 bg-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Score display */}
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color }}>
          {score}%
        </div>
        <div className="text-sm text-gray-600">Resilience</div>
      </div>
    </div>
  );
}
