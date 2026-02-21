import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ResilienceTank } from "../components/ResilienceTank";
import { DriftGauge } from "../components/DriftGauge";
import {
  getUserProfile,
  getCheckInsLast7Days,
  getTodaysCheckIn,
  getPoints,
  getHealthTasks,
  completeHealthTask,
  //   type UserProfile,
  //   type DailyCheckIn,
  //   type HealthTask,
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
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

export function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = (useState < UserProfile) | (null > null);
  //   const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [todayCheckIn, setTodayCheckIn] =
    (useState < DailyCheckIn) | (null > null);
  const [driftResult, setDriftResult] = useState < any > null;
  const [points, setPoints] = useState(0);
  //   const [healthTasks, setHealthTasks] = useState<HealthTask[]>([]);

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

  //   const handleCompleteTask = (taskId: string) => {
  //     completeHealthTask(taskId);
  //     const tasks = getHealthTasks();
  //     setHealthTasks(tasks);
  //     setPoints(getPoints());
  //     toast.success("Task completed! Points earned! 🎉");
  //   };

  const handleExport = () => {
    const report = generateHealthReport(profile, checkIns, driftResult);
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DriftCare_Health_Report_${new Date().toISOString().split("T")[0]}.txt`;
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

        {/* Main Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Resilience Tank</CardTitle>
              <CardDescription>
                How full is your health tank today?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResilienceTank
                score={driftResult.resilienceScore}
                size="large"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drift Level</CardTitle>
              <CardDescription>
                Are you drifting from your baseline?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DriftGauge level={driftResult.driftLevel} />
            </CardContent>
          </Card>
        </div>

        {/* Health Performance Radar */}
        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Health Performance Overview</CardTitle>
              <CardDescription>Your health metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
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
            className={`border-2 ${
              driftResult.driftLevel === "critical"
                ? "border-red-500 bg-red-50"
                : driftResult.driftLevel === "concern"
                  ? "border-orange-500 bg-orange-50"
                  : driftResult.driftLevel === "watch"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-emerald-500 bg-emerald-50"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <AlertDescription className="text-base">
              {contextMessage}
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Alerts */}
        {driftResult.alerts.length > 0 && (
          <Card className="border-orange-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Health Alerts
              </CardTitle>
            </CardHeader>
            {/* <CardContent className="space-y-3">
              {driftResult.alerts.map((alert: any) => (
                <Alert key={alert.id} className={`${
                  alert.severity === "high" ? "border-red-400 bg-red-50" : "border-yellow-400 bg-yellow-50"
                }`}>
                  <AlertDescription>
                    <div className="font-semibold">{alert.message}</div>
                    <div className="text-sm mt-1">{alert.recommendation}</div>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent> */}
          </Card>
        )}

        {/* Insights */}
        {driftResult.insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Today's Insights
              </CardTitle>
            </CardHeader>
            {/* <CardContent>
              <ul className="space-y-2">
                {driftResult.insights.map((insight: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600">•</span>
                    <span className="text-sm">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent> */}
          </Card>
        )}

        {/* 7-Day Trend */}
        {checkIns.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>7-Day Health Trends</CardTitle>
              <CardDescription>
                Your resilience, stress, and mood over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: "12px" }} />
                  <YAxis style={{ fontSize: "12px" }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="resilience"
                    stroke="#10b981"
                    fill="#10b98133"
                    name="Resilience"
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#f97316"
                    name="Stress"
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#8b5cf6"
                    name="Mood"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Daily Health Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Daily Health Tasks</span>
              <span className="text-sm font-normal text-gray-600">
                {completedTasks}/{healthTasks.length} Complete
              </span>
            </CardTitle>
            <CardDescription>
              Complete tasks to earn points and improve your health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {healthTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                  task.completed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => !task.completed && handleCompleteTask(task.id)}
                  disabled={task.completed}
                  className="p-0 h-6 w-6"
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1">
                  <div
                    className={`font-semibold ${task.completed ? "line-through text-gray-600" : ""}`}
                  >
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {task.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-semibold text-yellow-700">
                      +{task.points} points
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button onClick={handleCheckIn} className="h-20 flex flex-col gap-1">
            <Calendar className="w-6 h-6" />
            <span>{todayCheckIn ? "Done Today ✓" : "Daily Check-In"}</span>
          </Button>
          <Button
            onClick={handleFindDoctor}
            variant="outline"
            className="h-20 flex flex-col gap-1"
          >
            <MapPin className="w-6 h-6" />
            <span>Find a Doctor</span>
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="h-20 flex flex-col gap-1"
          >
            <FileText className="w-6 h-6" />
            <span>Export Report</span>
          </Button>
        </div>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {checkIns.length}
              </div>
              <div className="text-sm text-gray-600">Check-ins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.bmi}
              </div>
              <div className="text-sm text-gray-600">BMI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {todayCheckIn ? todayCheckIn.hoursSlept : "-"}h
              </div>
              <div className="text-sm text-gray-600">Sleep (Today)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profile.city}
              </div>
              <div className="text-sm text-gray-600">Location</div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Remember:</strong> DriftCare is NOT a diagnostic tool.
              </p>
              <p className="text-xs text-gray-600">
                We detect patterns and encourage early consultation with
                licensed healthcare professionals.
              </p>
              <p className="text-xs text-emerald-700">
                🔒 Your data is private, encrypted, and never shared.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Generate downloadable health report
// function generateHealthReport(
//   profile: UserProfile | null,
//   checkIns: DailyCheckIn[],
//   driftResult: any
// ): string {
//   const today = new Date().toLocaleDateString();

//   return `
// ═══════════════════════════════════════════
//     DRIFTCARE NG - HEALTH SUMMARY REPORT
// ═══════════════════════════════════════════

// Generated: ${today}
// Patient Name: [Fill in your name]
// Age: ${profile?.age || "N/A"}
// Location: ${profile?.city}, ${profile?.state}

// ───────────────────────────────────────────
// CURRENT HEALTH STATUS
// ───────────────────────────────────────────

// Resilience Score: ${driftResult.resilienceScore}/100
// Drift Level: ${driftResult.driftLevel.toUpperCase()}
// BMI: ${profile?.bmi || "N/A"}

// ───────────────────────────────────────────
// ACTIVE ALERTS
// ───────────────────────────────────────────

// ${driftResult.alerts.length > 0 ? driftResult.alerts.map((a: any) => `
// ⚠️ ${a.severity.toUpperCase()}: ${a.message}
//    Recommendation: ${a.recommendation}
// `).join("\n") : "No active alerts."}

// ───────────────────────────────────────────
// LAST 7 DAYS SUMMARY
// ───────────────────────────────────────────

// Total Check-ins: ${checkIns.length}
// Average Sleep: ${(checkIns.reduce((sum, c) => sum + c.hoursSlept, 0) / checkIns.length).toFixed(1)} hours
// Average Stress Level: ${(checkIns.reduce((sum, c) => sum + c.stressLevel, 0) / checkIns.length).toFixed(1)}/10
// Average Mood: ${(checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length).toFixed(1)}/10

// ───────────────────────────────────────────
// MEDICAL HISTORY
// ───────────────────────────────────────────

// Known Conditions: ${profile?.knownConditions.length ? profile.knownConditions.join(", ") : "None"}
// Family History: ${profile?.familyHistory.length ? profile.familyHistory.join(", ") : "None"}

// ───────────────────────────────────────────
// NOTES FOR HEALTHCARE PROVIDER
// ───────────────────────────────────────────

// This report is generated by DriftCare NG, a preventive health
// monitoring tool. It is NOT a diagnostic tool. Please use this
// information as context for clinical assessment.

// The patient has been tracking daily health metrics including:
// - Sleep patterns
// - Stress levels
// - Physical activity
// - Hydration
// - Symptoms

// Please review the alerts and trends above during consultation.

// ───────────────────────────────────────────

// DriftCare NG | Preventive Health for Nigeria
// Not a substitute for professional medical advice.

// ═══════════════════════════════════════════
// `;
// }
