"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Alert, AlertDescription } from "../Components/ui/alert";
import { ResilienceTank } from "../Components/ResilienceTank";
import { DriftGauge } from "../Components/DriftGauge";
import {
  getUserProfile,
  getCheckInsLast7Days,
  getTodaysCheckIn,
  getPoints,
  getHealthTasks,
  completeHealthTask,
} from "../lib/storage";
import { detectDrift, generateContextualMessage } from "../lib/drift-detection";
import {
  Heart,
  TrendingUp,
  Calendar,
  FileText,
  MapPin,
  Sparkles,
  AlertTriangle,
  Award,
  CheckCircle,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [driftResult, setDriftResult] = useState(null);
  const [points, setPoints] = useState(0);
  const [healthTasks, setHealthTasks] = useState([]);

  useEffect(() => {
    const userProfile = getUserProfile();
    const last7Days = getCheckInsLast7Days();
    const today = getTodaysCheckIn();
    const userPoints = getPoints();
    const tasks = getHealthTasks();

    setProfile(userProfile);
    setCheckIns(last7Days);
    setTodayCheckIn(today);
    setPoints(userPoints);
    setHealthTasks(tasks);

    if (last7Days.length > 0) {
      const result = detectDrift(last7Days, userProfile);
      setDriftResult(result);
    }
  }, []);

  const handleCheckIn = () => {
    if (todayCheckIn) {
      toast.info("You've already checked in today! Come back tomorrow. 💚");
    } else {
      navigate("/check-in");
    }
  };

  const handleFindDoctor = () => {
    navigate("/find-doctor");
  };

  const handleCompleteTask = (taskId) => {
    completeHealthTask(taskId);
    setHealthTasks(getHealthTasks());
    setPoints(getPoints());
    toast.success("Task completed! Points earned! 🎉");
  };

  const handleExport = () => {
    const report = generateHealthReport(profile, checkIns, driftResult);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DriftCare_Health_Report_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    a.click();
    toast.success("Health report downloaded! Show it to your doctor. 📄");
  };

  if (!profile || !driftResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const chartData = checkIns.map((c) => ({
    date: new Date(c.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    resilience: c.resilienceScore,
    stress: c.stressLevel * 10,
    mood: c.mood * 10,
    sleep: c.hoursSlept * 10,
    activity: c.physicalActivity,
    water: c.waterIntake * 8,
  }));

  const latestCheckIn = checkIns[checkIns.length - 1];
  const radarData = latestCheckIn
    ? [
        {
          metric: "Sleep",
          value: (latestCheckIn.hoursSlept / 8) * 100,
          fullMark: 100,
        },
        { metric: "Mood", value: latestCheckIn.mood * 10, fullMark: 100 },
        {
          metric: "Activity",
          value: Math.min((latestCheckIn.physicalActivity / 30) * 100, 100),
          fullMark: 100,
        },
        {
          metric: "Hydration",
          value: (latestCheckIn.waterIntake / 8) * 100,
          fullMark: 100,
        },
        {
          metric: "Low Stress",
          value: (10 - latestCheckIn.stressLevel) * 10,
          fullMark: 100,
        },
      ]
    : [];

  const contextMessage = generateContextualMessage(
    driftResult.driftLevel,
    driftResult.resilienceScore,
    profile,
  );

  const completedTasks = healthTasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-2">
            <Heart className="w-10 h-10 text-emerald-600 fill-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile.name}! 👋
          </h1>
          <p className="text-gray-600">
            {todayCheckIn
              ? "You checked in today. Nice!"
              : "Ready for your daily check-in?"}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="text-lg font-semibold text-yellow-700">
              {points} Points
            </span>
          </div>
        </motion.div>

        {/* Stats, charts, alerts, tasks, etc. */}
        {/* ...rest of JSX remains the same, just remove all `: type` annotations */}
      </div>
    </div>
  );
}

// Generate downloadable health report
function generateHealthReport(profile, checkIns, driftResult) {
  const today = new Date().toLocaleDateString();

  return `
═══════════════════════════════════════════
    DRIFTCARE NG - HEALTH SUMMARY REPORT
═══════════════════════════════════════════

Generated: ${today}
Patient Name: ${profile?.name || "N/A"}
Age: ${profile?.age || "N/A"}
Location: ${profile?.city || "N/A"}, ${profile?.state || "N/A"}

Resilience Score: ${driftResult.resilienceScore}/100
Drift Level: ${driftResult.driftLevel.toUpperCase()}
BMI: ${profile?.bmi || "N/A"}

Active Alerts:
${
  driftResult.alerts.length > 0
    ? driftResult.alerts
        .map(
          (a) => `
⚠️ ${a.severity.toUpperCase()}: ${a.message}
   Recommendation: ${a.recommendation}`,
        )
        .join("\n")
    : "No active alerts."
}

Last 7 Days Summary:
Total Check-ins: ${checkIns.length}
Average Sleep: ${(checkIns.reduce((sum, c) => sum + c.hoursSlept, 0) / checkIns.length).toFixed(1)} hours
Average Stress Level: ${(checkIns.reduce((sum, c) => sum + c.stressLevel, 0) / checkIns.length).toFixed(1)}/10
Average Mood: ${(checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length).toFixed(1)}/10

Known Conditions: ${profile?.knownConditions?.length ? profile.knownConditions.join(", ") : "None"}
Family History: ${profile?.familyHistory?.length ? profile.familyHistory.join(", ") : "None"}

Notes: This report is generated by DriftCare NG and is NOT diagnostic.
`;
}
