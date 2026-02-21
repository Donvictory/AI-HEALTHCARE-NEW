"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowRight,
  Download,
} from "lucide-react";
import { toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
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
  const [profile] = useState(() => getUserProfile());
  const [checkIns] = useState(() => getCheckInsLast7Days());
  const [todayCheckIn] = useState(() => getTodaysCheckIn());
  const [points, setPoints] = useState(() => getPoints());
  const [healthTasks, setHealthTasks] = useState(() => getHealthTasks());

  const [driftResult] = useState(() => {
    const last7Days = getCheckInsLast7Days();
    if (last7Days.length > 0) {
      return detectDrift(last7Days, getUserProfile());
    }
    return {
      driftLevel: "none",
      resilienceScore: 100,
      alerts: [],
    };
  });

  const handleCheckIn = () => {
    if (todayCheckIn) {
      toast.info("You've already checked in today! Come back tomorrow. 💚");
    } else {
      navigate("/check-in");
    }
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
        <p className="text-emerald-600 animate-pulse">
          Initializing health metrics...
        </p>
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
  }));

  const latestCheckIn = checkIns[checkIns.length - 1];
  const radarData = latestCheckIn
    ? [
        { metric: "Sleep", value: (latestCheckIn.hoursSlept / 8) * 100 },
        { metric: "Mood", value: latestCheckIn.mood * 10 },
        {
          metric: "Activity",
          value: Math.min((latestCheckIn.physicalActivity / 30) * 100, 100),
        },
        { metric: "Hydration", value: (latestCheckIn.waterIntake / 8) * 100 },
        {
          metric: "Stress Management",
          value: (10 - latestCheckIn.stressLevel) * 10,
        },
      ]
    : [
        { metric: "Sleep", value: 0 },
        { metric: "Mood", value: 0 },
        { metric: "Activity", value: 0 },
        { metric: "Hydration", value: 0 },
        { metric: "Stress Management", value: 0 },
      ];

  const contextMessage = generateContextualMessage(
    driftResult.driftLevel,
    driftResult.resilienceScore,
    profile,
  );

  return (
    <div className="min-h-screen p-4 pb-24 bg-gray-50/50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile.name}! 👋
            </h1>
            <p className="text-gray-600">
              {todayCheckIn
                ? "You've completed your check-in for today."
                : "It's time for your health check-in."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-700">{points} Points</span>
            </div>
            <Button
              onClick={handleCheckIn}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Daily Check-in
            </Button>
          </div>
        </motion.div>

        {/* Resilience & Drift Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Resilience Tank
              </CardTitle>
              <CardDescription>Your current adaptive capacity</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <ResilienceTank score={driftResult.resilienceScore} />
              <p className="mt-4 text-sm text-center text-gray-500 max-w-[200px]">
                {contextMessage}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Drift Analysis
              </CardTitle>
              <CardDescription>
                Detection of health pattern shifts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4">
              <DriftGauge driftLevel={driftResult.driftLevel} />
              <div className="mt-6 w-full space-y-2">
                {driftResult.alerts && driftResult.alerts.length > 0 ? (
                  driftResult.alerts.slice(0, 2).map((alert, i) => (
                    <Alert
                      key={i}
                      variant={
                        alert.severity === "high" ? "destructive" : "default"
                      }
                      className="py-2"
                    >
                      <AlertDescription className="text-xs">
                        <strong>{alert.message}</strong> -{" "}
                        {alert.recommendation}
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <div className="text-center py-4 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      Stability detected in your patterns
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[300px]">
                <p className="text-sm font-semibold mb-4 text-gray-500">
                  Resilience vs Mood (Last 7 Days)
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#059669"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#059669"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="resilience"
                      stroke="#059669"
                      fillOpacity={1}
                      fill="url(#colorRes)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="#8b5cf6"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[300px] flex flex-col items-center">
                <p className="text-sm font-semibold mb-4 text-gray-500 w-full text-center">
                  Health Balance
                </p>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={radarData}
                  >
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                    />
                    <Radar
                      name="Today"
                      dataKey="value"
                      stroke="#059669"
                      fill="#059669"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Daily Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {healthTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed
                      ? "bg-gray-50 border-gray-100 opacity-60"
                      : "bg-white border-emerald-50 hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        +{task.points} Points
                      </p>
                    </div>
                  </div>
                  {!task.completed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCompleteTask(task.id)}
                      className="text-xs hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button
              className="w-full h-auto py-6 flex-col gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg border-none"
              onClick={handleExport}
            >
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <span className="block font-bold">Health Report</span>
                <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest">
                  Download PDF/TXT
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto py-6 flex-col gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
              onClick={() => navigate("/find-doctor")}
            >
              <MapPin className="w-6 h-6" />
              <div className="text-center">
                <span className="block font-bold">Find Local Care</span>
                <span className="text-[10px] opacity-80 uppercase font-bold tracking-widest">
                  Specialists Near You
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

Resilience Score: ${driftResult.resilienceScore || 0}/100
Drift Level: ${(driftResult.driftLevel || "N/A").toUpperCase()}
BMI: ${profile?.bmi || "N/A"}

Active Alerts:
${
  driftResult.alerts && driftResult.alerts.length > 0
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
Average Sleep: ${checkIns.length > 0 ? (checkIns.reduce((sum, c) => sum + c.hoursSlept, 0) / checkIns.length).toFixed(1) : "N/A"} hours
Average Stress Level: ${checkIns.length > 0 ? (checkIns.reduce((sum, c) => sum + c.stressLevel, 0) / checkIns.length).toFixed(1) : "N/A"}/10

Known Conditions: ${profile?.knownConditions?.length ? profile.knownConditions.join(", ") : "None"}

Notes: This report is generated by DriftCare NG and is NOT diagnostic.
  `;
}
