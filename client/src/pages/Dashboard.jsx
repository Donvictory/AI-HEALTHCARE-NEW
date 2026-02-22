"use client";

import { useEffect, useState } from "react";
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
  toggleHealthTask,
  getRemedyTasks,
  saveRemedyTasks,
  toggleRemedyTask,
} from "../lib/storage";
import { generateRemedyTasks } from "../lib/remedy-tasks";
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
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import { useMe } from "../hooks/use-auth";
import { useDailyCheckIns, useTodayCheckIn } from "../hooks/use-daily-check-in";

export function Dashboard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: isProfileLoading } = useMe();
  const { data: backendCheckIns, isLoading: isCheckInsLoading } =
    useDailyCheckIns();
  const { data: backendTodayCheckIn, isLoading: isTodayLoading } =
    useTodayCheckIn();

  const [checkIns, setCheckIns] = useState([]);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [driftResult, setDriftResult] = useState(null);
  const [points, setPoints] = useState(0);
  const [healthTasks, setHealthTasks] = useState([]);
  const [remedyTasks, setRemedyTasks] = useState([]);

  useEffect(() => {
    // 1. Get Local Fallbacks
    const localLast7Days = getCheckInsLast7Days();
    const localToday = getTodaysCheckIn();
    const userPoints = getPoints();
    const tasks = getHealthTasks();

    // 2. Merge with Backend (Backend takes priority)
    const rawCheckIns = backendCheckIns || localLast7Days;
    const rawToday = backendTodayCheckIn || localToday;

    // 3. Normalize field names consistently (backend → internal shape)
    //    This must match the normalise() logic inside drift-detection.js
    const normalizeRecord = (c) => ({
      ...c,
      hoursSlept: parseFloat(c.hoursSlept) || 0,
      stressLevel: parseFloat(c.stressLevel) || 0,
      mood: parseFloat(c.currentMood ?? c.mood) || 0,
      physicalActivity:
        parseFloat(c.dailyActivityMeasure ?? c.physicalActivity) || 0,
      waterIntake: parseFloat(c.numOfWaterGlasses ?? c.waterIntake) || 0,
      healthStatus: (
        c.currentHealthStatus ||
        c.healthStatus ||
        "GOOD"
      ).toUpperCase(),
      symptoms: Array.isArray(c.symptomsToday)
        ? c.symptomsToday
        : Array.isArray(c.symptoms)
          ? c.symptoms
          : [],
      date: c.createdAt || c.date || new Date().toISOString(),
    });

    const normalizedCheckIns = rawCheckIns.map(normalizeRecord);
    const normalizedToday = rawToday ? normalizeRecord(rawToday) : null;

    setCheckIns(normalizedCheckIns);
    setTodayCheckIn(normalizedToday);
    setPoints(userPoints);
    setHealthTasks(tasks);

    // Generate or restore today's remedy tasks
    const existingRemedy = getRemedyTasks();
    if (normalizedToday) {
      if (existingRemedy.length > 0) {
        // Already generated today — restore them
        setRemedyTasks(existingRemedy);
      } else {
        // Fresh generation based on today's check-in
        const generated = generateRemedyTasks(normalizedToday, profile);
        saveRemedyTasks(generated);
        setRemedyTasks(generated);
      }
    } else {
      // No check-in yet — clear any stale remedy tasks
      setRemedyTasks([]);
    }

    if (normalizedCheckIns.length > 0) {
      const result = detectDrift(normalizedCheckIns, profile);
      setDriftResult(result);
    } else {
      setDriftResult({
        driftLevel: "none",
        resilienceScore: 100,
        alerts: [],
        insights: [],
      });
    }
  }, [profile, backendCheckIns, backendTodayCheckIn]);

  const isLoading = isProfileLoading || isCheckInsLoading || isTodayLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-900 font-bold animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    // Falls back to local storage if not logged in to backend, or stays loading
    // For now, if no profile from backend, we might want to redirect to login
    // navigate("/login");
    // return null;
  }

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

  const handleToggleTask = (taskId, isRemedy = false) => {
    if (isRemedy) {
      const isNowCompleted = toggleRemedyTask(taskId);
      setRemedyTasks(getRemedyTasks());
      setPoints(getPoints());
      if (isNowCompleted) {
        toast.success("Remedy task done! Points earned! 🌿");
      } else {
        toast.info("Task unchecked. Points deducted. 🔄");
      }
    } else {
      const isNowCompleted = toggleHealthTask(taskId);
      setHealthTasks(getHealthTasks());
      setPoints(getPoints());
      if (isNowCompleted) {
        toast.success("Task completed! Points earned! 🎉");
      } else {
        toast.info("Task unchecked. Points deducted. 🔄");
      }
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-600 font-bold animate-pulse">
            Analyzing Health Metrics...
          </p>
        </div>
      </div>
    );
  }

  const chartData = checkIns.map((c, index) => {
    // Simulate heart rate for now (65-85 BPM range)
    const bpm = 68 + Math.floor((c.stressLevel / 10) * 12) + (index % 3);
    return {
      date: new Date(c.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      dayLabel: `Day ${index + 1}`,
      resilience: c.resilienceScore,
      stress: c.stressLevel * 10,
      mood: c.mood * 10,
      sleep: c.hoursSlept * 10,
      activity: c.physicalActivity,
      water: c.waterIntake * 8,
      bpm: bpm,
    };
  });

  // Health metrics for radar chart
  const latestCheckIn = checkIns[checkIns.length - 1];
  const radarData = latestCheckIn
    ? [
        {
          metric: "Sleep",
          value: (latestCheckIn.hoursSlept / 8) * 100,
          fullMark: 100,
        },
        {
          metric: "Mood",
          value: latestCheckIn.mood * 10,
          fullMark: 100,
        },
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
    <div className="min-h-screen p-4 pb-24 bg-gray-50/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/50 backdrop-blur-sm rounded-[2rem] p-8 border border-white/20 shadow-xl shadow-black/5"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-600 p-4 rounded-3xl shadow-lg shadow-emerald-200">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, {profile.name}! 👋
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            {todayCheckIn
              ? "You've completed your health check-in. Excellent work!"
              : "Your body is a temple. Ready for your daily check-in?"}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="bg-yellow-50 px-6 py-2 rounded-2xl border border-yellow-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-black text-yellow-700">
                {profile?.healthPoints ?? points} Points
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Resilience Tank
              </CardTitle>
              <CardDescription>Your current adaptive capacity</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ResilienceTank score={driftResult.resilienceScore} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                Drift Analysis
              </CardTitle>
              <CardDescription>
                Detection of health pattern shifts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <DriftGauge driftLevel={driftResult.driftLevel} />
            </CardContent>
          </Card>
        </div>

        {/* Health Performance Radar */}
        {radarData.length > 0 && (
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Health Performance Overview
              </CardTitle>
              <CardDescription>Your health metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "#64748b", fontWeight: 700, fontSize: 13 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} hide />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* AI Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Alert
            className={`border-none shadow-xl p-8 rounded-[2rem] flex items-start gap-4 ${
              driftResult.driftLevel === "critical"
                ? "bg-red-50 text-red-900"
                : driftResult.driftLevel === "concern"
                  ? "bg-orange-50 text-orange-900"
                  : driftResult.driftLevel === "watch"
                    ? "bg-yellow-50 text-yellow-900"
                    : "bg-emerald-50 text-emerald-900"
            }`}
          >
            <div
              className={`p-4 rounded-3xl ${
                driftResult.driftLevel === "critical"
                  ? "bg-red-200"
                  : driftResult.driftLevel === "concern"
                    ? "bg-orange-200"
                    : driftResult.driftLevel === "watch"
                      ? "bg-yellow-200"
                      : "bg-emerald-200"
              }`}
            >
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-2">
                Companion
              </p>
              <AlertDescription className="text-lg font-bold leading-relaxed">
                {contextMessage}
              </AlertDescription>
            </div>
          </Alert>
        </motion.div>

        {/* Alerts */}
        {driftResult.alerts && driftResult.alerts.length > 0 && (
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {driftResult.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border-l-8 ${
                    alert.severity === "high"
                      ? "bg-red-50 border-red-500 text-red-900"
                      : "bg-yellow-50 border-yellow-500 text-yellow-900"
                  }`}
                >
                  <div className="font-black text-lg">{alert.message}</div>
                  <div className="mt-2 text-sm font-medium opacity-80">
                    {alert.recommendation}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        {driftResult.insights && driftResult.insights.length > 0 && (
          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-emerald-900">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Patterns & Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {driftResult.insights.map((insight, idx) => {
                  const isPositive =
                    insight.startsWith("😊") ||
                    insight.startsWith("😴") ||
                    insight.startsWith("💧") ||
                    insight.startsWith("🏃");
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-2xl border ${
                        isPositive
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-amber-50 border-amber-100"
                      }`}
                    >
                      <CheckCircle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          isPositive ? "text-emerald-600" : "text-amber-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-bold ${
                          isPositive ? "text-emerald-800" : "text-amber-800"
                        }`}
                      >
                        {insight}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Biometric Trends (Longitudinal Tracker) */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-xl">
                    Daily Check-in Trends
                  </CardTitle>
                </div>
                <CardDescription>
                  Resilience & Stress (Past 7 Days)
                </CardDescription>
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Trend Analysis
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {checkIns.length > 0 ? (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="dayLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-2xl ring-1 ring-black/5">
                              <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
                                {payload[0].payload.date}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                                    <span className="text-xs font-bold text-gray-600">
                                      Stress Level
                                    </span>
                                  </div>
                                  <span className="text-xs font-black text-gray-900">
                                    {payload[0].payload.stress}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-gray-600">
                                      Resilience
                                    </span>
                                  </div>
                                  <span className="text-xs font-black text-gray-900">
                                    {payload[0].payload.resilience}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{
                        paddingBottom: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    />
                    <Bar
                      dataKey="resilience"
                      name="Resilience"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    />
                    <Bar
                      dataKey="stress"
                      name="Stress"
                      fill="#f97316"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <TrendingUp className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-gray-900 font-black">No Trend Data Yet</p>
                  <p className="text-xs font-medium text-gray-500 max-w-[200px] mx-auto">
                    Complete your first daily check-in to unlock biometric
                    tracking.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/check-in")}
                  className="rounded-xl font-bold border-2"
                >
                  Start Check-in
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Health Tasks — All in one section */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                  Daily Health Tasks
                </CardTitle>
                <CardDescription>
                  {remedyTasks.length > 0
                    ? "Personalized tasks based on your check-in data"
                    : "Complete a check-in to unlock personalized remedy tasks"}
                </CardDescription>
              </div>
              <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                {remedyTasks.filter((t) => t.completed).length + completedTasks}
                /{remedyTasks.length + healthTasks.length} Done
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Personalized Remedy Tasks (from check-in) */}
            {remedyTasks.length > 0 ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px flex-1 bg-emerald-100" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    Recommended Remedies
                  </span>
                  <div className="h-px flex-1 bg-emerald-100" />
                </div>
                {remedyTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, true)}
                    className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      task.completed
                        ? "bg-emerald-50/30 border-emerald-100 opacity-80"
                        : "bg-white border-gray-100 hover:border-emerald-500 hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                    }`}
                  >
                    <div className="mt-1">
                      {task.completed ? (
                        <div className="w-7 h-7 bg-emerald-600 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                          <Circle className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{task.icon}</span>
                        <div
                          className={`text-lg font-black ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}
                        >
                          {task.title}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-500 mt-1">
                        {task.description}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="bg-yellow-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 ring-1 ring-yellow-100">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-black text-yellow-700">
                            +{task.points} PTS
                          </span>
                        </div>
                        <div className="bg-emerald-50 px-2.5 py-1 rounded-lg ring-1 ring-emerald-100">
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                            {task.category?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-3 bg-emerald-50/30 rounded-3xl border-2 border-dashed border-emerald-100">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <Heart className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <p className="text-emerald-900 font-black text-sm">
                    No Remedy Tasks Yet
                  </p>
                  <p className="text-xs font-medium text-gray-500 max-w-[240px] mx-auto">
                    Complete your daily check-in to get personalized health
                    remedies.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/check-in")}
                  className="rounded-xl font-bold border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Start Check-in
                </Button>
              </div>
            )}

            {/* Static Health Habits — always visible */}
            {healthTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2 mt-6 mb-2">
                  <div className="h-px flex-1 bg-blue-100" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Daily Habits
                  </span>
                  <div className="h-px flex-1 bg-blue-100" />
                </div>
                {healthTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer ${
                      task.completed
                        ? "bg-blue-50/30 border-blue-100 opacity-80"
                        : "bg-white border-gray-100 hover:border-blue-400 hover:scale-[1.01] active:scale-[0.99] group shadow-sm"
                    }`}
                  >
                    <div className="mt-1">
                      {task.completed ? (
                        <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Circle className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-lg font-black ${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="bg-yellow-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 ring-1 ring-yellow-100">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-black text-yellow-700">
                            +{task.points} PTS
                          </span>
                        </div>
                        <div className="bg-blue-50 px-2.5 py-1 rounded-lg ring-1 ring-blue-100">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                            Habit
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-xl">Biological Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 bg-gray-50/50">
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center ring-1 ring-gray-100">
              <div className="text-3xl font-black text-emerald-600">
                {profile?.totalCheckIns ?? checkIns.length}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Records
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center ring-1 ring-gray-100">
              <div className="text-3xl font-black text-blue-600">
                {profile.bmi || "0.0"}
              </div>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-tight -mt-1">
                {profile.bmiCategory || "Calculating..."}
              </div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 border-t border-gray-50 pt-1">
                {profile.weight}kg / {profile.height}cm
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                Body Index
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center ring-1 ring-gray-100">
              <div className="text-3xl font-black text-purple-600">
                {todayCheckIn ? todayCheckIn.hoursSlept : "-"}h
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Sleep today
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm text-center ring-1 ring-gray-100">
              <div className="text-2xl font-black text-orange-600 truncate px-2">
                {profile.city}
              </div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 text-center">
                Location
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="bg-gradient-to-br from-emerald-600 to-blue-700 text-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden mb-28">
          <CardContent className="p-10 relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="text-center space-y-4 relative z-10">
              <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                Medical Disclaimer
              </div>
              <p className="text-xl font-bold leading-relaxed">
                DriftCare NG detects behavioral drift — not disease. It is a
                risk intelligence layer, not a diagnostic tool.
              </p>
              <p className="text-sm font-medium opacity-80 max-w-lg mx-auto">
                Always consult a licensed healthcare professional for medical
                diagnoses. This platform encourages early consultation — it does
                NOT diagnose, prescribe, or replace doctors.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Behavior-First. Not Diagnosis.
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl">
                  <span className="text-xs font-black uppercase tracking-widest">
                    🩺 Doctor-Ready Export Available
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Action Buttons — always visible at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-5xl mx-auto px-4 py-3 grid grid-cols-3 gap-3">
          <Button
            onClick={handleCheckIn}
            className="h-16 md:h-20 rounded-2xl flex flex-col gap-1 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
            <span className="font-black text-[10px] md:text-sm">
              {todayCheckIn ? "Completed ✓" : "Check-In"}
            </span>
          </Button>
          <Button
            onClick={handleFindDoctor}
            variant="outline"
            className="h-16 md:h-20 rounded-2xl flex flex-col gap-1 border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 shadow-lg group transition-all hover:scale-[1.02] active:scale-95"
          >
            <MapPin className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-bounce" />
            <span className="font-black text-[10px] md:text-sm">Find Care</span>
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="h-16 md:h-20 rounded-2xl flex flex-col gap-1 border-2 border-purple-100 text-purple-700 hover:bg-purple-50 shadow-lg group transition-all hover:scale-[1.02] active:scale-95"
          >
            <FileText className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12" />
            <span className="font-black text-[10px] md:text-sm">Export</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Generate downloadable health report (Doctor-Ready Export)
function generateHealthReport(profile, checkIns, driftResult) {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
═══════════════════════════════════════════
    DRIFTCARE NG — DOCTOR-READY HEALTH EXPORT
    AI-Powered Preventive Health Drift Monitor
═══════════════════════════════════════════

Generated: ${today}
Patient Name: ${profile?.name || "[Patient Name]"}
Age: ${profile?.age || "N/A"}
Gender: ${profile?.gender || "N/A"}
Location: ${profile?.city || "N/A"}, Nigeria
BMI: ${profile?.bmi || "N/A"}

⚠️  IMPORTANT: This is NOT a diagnostic report.
    DriftCare NG is a preventive health drift monitor.
    Data below represents behavioral trends only.

───────────────────────────────────────────
CURRENT DRIFT STATUS
───────────────────────────────────────────

Resilience Score : ${driftResult.resilienceScore}/100
Drift Level      : ${driftResult.driftLevel.toUpperCase()}

Drift Patterns Monitored:
  🩺 Hypertension Risk  — stress + headache + poor sleep + family history
  🌡️  Febrile Illness    — fever + fatigue + reduced activity (malaria-like)
  🧠 Stress & Burnout   — sustained stress + mood decline + poor sleep
  🩸 Diabetes Risk      — high BMI + low activity + fatigue + family history

───────────────────────────────────────────
ACTIVE ALERTS
───────────────────────────────────────────

${
  driftResult.alerts && driftResult.alerts.length > 0
    ? driftResult.alerts
        .map(
          (a) => `
⚠️  ${a.severity.toUpperCase()}: ${a.message}
    Recommendation: ${a.recommendation}
`,
        )
        .join("\n")
    : "✅ No active drift alerts at this time."
}

───────────────────────────────────────────
LAST 7 DAYS — BEHAVIORAL SUMMARY
───────────────────────────────────────────

Total Check-ins       : ${checkIns.length}
Average Sleep         : ${
    checkIns.length > 0
      ? (
          checkIns.reduce((sum, c) => sum + c.hoursSlept, 0) / checkIns.length
        ).toFixed(1)
      : "N/A"
  } hours/night
Average Stress Level  : ${
    checkIns.length > 0
      ? (
          checkIns.reduce((sum, c) => sum + c.stressLevel, 0) / checkIns.length
        ).toFixed(1)
      : "N/A"
  }/10
Average Mood          : ${
    checkIns.length > 0
      ? (
          checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length
        ).toFixed(1)
      : "N/A"
  }/10
Average Activity      : ${
    checkIns.length > 0
      ? Math.round(
          checkIns.reduce((sum, c) => sum + (c.physicalActivity || 0), 0) /
            checkIns.length,
        )
      : "N/A"
  } mins/day
Average Water Intake  : ${
    checkIns.length > 0
      ? (
          checkIns.reduce((sum, c) => sum + (c.waterIntake || 0), 0) /
          checkIns.length
        ).toFixed(1)
      : "N/A"
  } glasses/day

───────────────────────────────────────────
MEDICAL HISTORY (SELF-REPORTED)
───────────────────────────────────────────

Known Conditions : ${
    profile?.knownConditions?.length
      ? profile.knownConditions.join(", ")
      : "None reported"
  }
Family History   : ${
    profile?.familyHistory?.length
      ? profile.familyHistory.join(", ")
      : "None reported"
  }

───────────────────────────────────────────
NOTES FOR HEALTHCARE PROVIDER
───────────────────────────────────────────

This report is generated by DriftCare NG — a Nigerian preventive
health drift monitoring platform. It is NOT a diagnostic tool.

The patient has been tracking daily behavioral health inputs:
  • Sleep duration & quality signals
  • Stress levels (self-reported, 1–10)
  • Mood trajectory (1–10)
  • Physical activity (minutes)
  • Hydration (glasses of water)
  • Symptoms: fever, headache, fatigue, cough, chest pain

DriftCare does NOT:
  ✗ Diagnose any condition
  ✗ Prescribe medication
  ✗ Replace clinical assessment

DriftCare DOES:
  ✓ Build a personal health baseline
  ✓ Detect deviations (drift) from that baseline
  ✓ Alert the user to seek early consultation

Please use the behavioral trends above as supplementary context
for your clinical assessment. Focus on the Drift Level and Alerts
sections as priority conversation starters.

───────────────────────────────────────────

DriftCare NG | Predictive Health Companion
AI-Powered Preventive Health for Nigeria
Not a substitute for professional medical advice.

═══════════════════════════════════════════
`;
}
