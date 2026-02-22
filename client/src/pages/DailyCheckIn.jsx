import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import { Slider } from "../Components/ui/slider";
import { Textarea } from "../Components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Checkbox } from "../Components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import {
  saveDailyCheckIn,
  getTodaysCheckIn,
  addPoints,
  saveMedicalReport,
} from "../lib/storage";
import {
  Heart,
  Sparkles,
  Moon,
  Brain,
  Droplet,
  Dumbbell,
  Activity,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const symptoms = [
  "None",
  "Fever",
  "Headache",
  "Fatigue",
  "Cough",
  "Chest Pain",
  "Dizziness",
  "Body Aches",
];

// Quick resilience calculation (detailed one happens in drift detection)
function calculateQuickScore(data) {
  let score = 100;
  if (data.hoursSlept < 6) score -= 15;
  if (data.stressLevel >= 8) score -= 15;
  if (data.mood <= 4) score -= 10;
  if (data.physicalActivity === 0) score -= 10;
  if (data.waterIntake < 4) score -= 10;
  if (data.symptoms.length > 1 && !data.symptoms.includes("None")) score -= 15;
  return Math.max(0, score);
}

export function DailyCheckIn() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [checkInData, setCheckInData] = useState({
    hoursSlept: 7,
    stressLevel: 5,
    mood: 7,
    physicalActivity: 0,
    waterIntake: 6,
    symptoms: ["None"],
    drinkAlcohol: false,
    smokedToday: false,
    journal: "",
    healthStatus: "",
    reportNotes: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already completed today
    const todayCheckIn = getTodaysCheckIn();
    if (todayCheckIn) {
      toast.info("You've already checked in today! 💚");
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setUploadedFile(file);
      toast.success("File uploaded successfully!");
    }
  };

  const handleComplete = async () => {
    const today = new Date().toISOString().split("T")[0];
    setIsSubmitting(true);

    // Artificial delay to simulate AI/Pattern analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Calculate basic resilience score (will be recalculated with drift detection)
    const resilienceScore = calculateQuickScore(checkInData);

    const checkIn = {
      id: `checkin-${Date.now()}`,
      date: today,
      hoursSlept: checkInData.hoursSlept,
      stressLevel: checkInData.stressLevel,
      mood: checkInData.mood,
      physicalActivity: checkInData.physicalActivity,
      waterIntake: checkInData.waterIntake,
      symptoms: checkInData.symptoms,
      journal: checkInData.journal,
      drinkAlcohol: checkInData.drinkAlcohol,
      smokedToday: checkInData.smokedToday,
      resilienceScore,
    };

    // Save medical report if uploaded
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = e.target?.result;
        const report = {
          id: `report-${Date.now()}`,
          fileName: uploadedFile.name,
          fileData,
          uploadDate: today,
          notes: checkInData.reportNotes,
        };
        saveMedicalReport(report);
      };
      reader.readAsDataURL(uploadedFile);
    }

    saveDailyCheckIn(checkIn);

    // Award 15 points for completing check-in
    addPoints(15);

    setIsSubmitting(false);
    toast.success("Check-in complete! You earned 15 points! 🎉");
    navigate("/dashboard");
  };

  const toggleSymptom = (symptom) => {
    setCheckInData((prev) => {
      let newSymptoms = [...prev.symptoms];

      if (symptom === "None") {
        newSymptoms = ["None"];
      } else {
        newSymptoms = newSymptoms.filter((s) => s !== "None");
        if (newSymptoms.includes(symptom)) {
          newSymptoms = newSymptoms.filter((s) => s !== symptom);
        } else {
          newSymptoms.push(symptom);
        }
        if (newSymptoms.length === 0) {
          newSymptoms = ["None"];
        }
      }

      return { ...prev, symptoms: newSymptoms };
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Heart className="w-12 h-12 text-emerald-600 fill-emerald-600" />
            </div>
            <CardTitle>Daily Check-In</CardTitle>
            <CardDescription>
              Just between me and you. No judgment, just tracking. 💚
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: Sleep & Energy */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    1 of 5 • Sleep & Energy
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-5 h-5 text-indigo-600" />
                    <Label>How many hours did you sleep last night?</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[checkInData.hoursSlept]}
                      onValueChange={([value]) =>
                        setCheckInData({ ...checkInData, hoursSlept: value })
                      }
                      min={0}
                      max={12}
                      step={0.5}
                      className="flex-1"
                    />
                    <div className="text-2xl font-bold text-emerald-600 w-16 text-center">
                      {checkInData.hoursSlept}h
                    </div>
                  </div>
                  {checkInData.hoursSlept < 6 && (
                    <p className="text-xs text-orange-600 mt-1">
                      That&apos;s low, boss. Your body needs rest to stay sharp.
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <Label>How&apos;s your stress level today?</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[checkInData.stressLevel]}
                      onValueChange={([value]) =>
                        setCheckInData({ ...checkInData, stressLevel: value })
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <div className="text-2xl font-bold text-purple-600 w-16 text-center">
                      {checkInData.stressLevel}/10
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Calm</span>
                    <span>Overwhelmed</span>
                  </div>
                  {checkInData.stressLevel >= 8 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Omo, take it easy. High stress kills slowly. 🫂
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    <Label>How&apos;s your mood right now?</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[checkInData.mood]}
                      onValueChange={([value]) =>
                        setCheckInData({ ...checkInData, mood: value })
                      }
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <div className="text-2xl font-bold text-yellow-600 w-16 text-center">
                      {checkInData.mood}/10
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Great</span>
                  </div>
                </div>

                <Button onClick={handleNext} className="w-full">
                  Next
                </Button>
              </div>
            )}

            {/* Step 2: Activity & Hydration */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    2 of 5 • Movement & Water
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-orange-600" />
                    <Label>Did you move your body today?</Label>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Walking, gym, dancing, anything counts!
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[checkInData.physicalActivity]}
                      onValueChange={([value]) =>
                        setCheckInData({
                          ...checkInData,
                          physicalActivity: value,
                        })
                      }
                      min={0}
                      max={120}
                      step={5}
                      className="flex-1"
                    />
                    <div className="text-2xl font-bold text-orange-600 w-20 text-center">
                      {checkInData.physicalActivity} min
                    </div>
                  </div>
                  {checkInData.physicalActivity === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Your body needs movement. Even 10 mins counts!
                    </p>
                  )}
                  {checkInData.physicalActivity >= 30 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Nice! You&apos;re putting in the work. 💪
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-blue-600" />
                    <Label>How many glasses of water today?</Label>
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[checkInData.waterIntake]}
                      onValueChange={([value]) =>
                        setCheckInData({ ...checkInData, waterIntake: value })
                      }
                      min={0}
                      max={12}
                      step={1}
                      className="flex-1"
                    />
                    <div className="text-2xl font-bold text-blue-600 w-16 text-center">
                      {checkInData.waterIntake}
                    </div>
                  </div>
                  {checkInData.waterIntake < 4 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Drink more water, bro. Lagos heat is not joking. 💧
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Health Status & Symptoms */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    3 of 5 • Health Status
                  </div>
                </div>

                <div>
                  <Label htmlFor="healthStatus">
                    How would you describe your current health status?
                  </Label>
                  <Select
                    value={checkInData.healthStatus}
                    onValueChange={(value) =>
                      setCheckInData({ ...checkInData, healthStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">
                        Excellent - Feeling great!
                      </SelectItem>
                      <SelectItem value="good">
                        Good - Normal, no issues
                      </SelectItem>
                      <SelectItem value="fair">
                        Fair - Some minor concerns
                      </SelectItem>
                      <SelectItem value="poor">
                        Poor - Not feeling well
                      </SelectItem>
                      <SelectItem value="very-poor">
                        Very Poor - Need medical attention
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-red-600" />
                    <Label>Any symptoms today?</Label>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Select all that apply. If nothing, just tick
                    &quot;None&quot;
                  </p>
                  <div className="space-y-2">
                    {symptoms.map((symptom) => (
                      <div key={symptom} className="flex items-center gap-2">
                        <Checkbox
                          id={symptom}
                          checked={checkInData.symptoms.includes(symptom)}
                          onCheckedChange={() => toggleSymptom(symptom)}
                        />
                        <Label htmlFor={symptom} className="cursor-pointer">
                          {symptom}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Medical Reports */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    4 of 5 • Medical Reports (Optional)
                  </div>
                </div>

                <div>
                  <Label htmlFor="fileUpload">
                    Upload Recent Medical Report
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    PDF, JPG, or PNG (Max 5MB)
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <input
                      id="fileUpload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <span className="text-sm text-emerald-600 font-semibold hover:underline">
                        Click to upload
                      </span>
                    </label>
                    {uploadedFile && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">
                          {uploadedFile.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="reportNotes">
                    Your feelings about the report
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    How do you feel about your recent test results or medical
                    visit?
                  </p>
                  <Textarea
                    id="reportNotes"
                    placeholder="E.g., My blood pressure reading was a bit high, feeling worried..."
                    value={checkInData.reportNotes}
                    onChange={(e) =>
                      setCheckInData({
                        ...checkInData,
                        reportNotes: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(3)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Lifestyle & Journal */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                    5 of 5 • Final Questions
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm text-gray-600">
                    Quick lifestyle checks (optional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="alcohol"
                      checked={checkInData.drinkAlcohol}
                      onCheckedChange={(checked) =>
                        setCheckInData({
                          ...checkInData,
                          drinkAlcohol: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="alcohol" className="cursor-pointer text-sm">
                      Had a drink last night? 🥂 (No judgment!)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="smoke"
                      checked={checkInData.smokedToday}
                      onCheckedChange={(checked) =>
                        setCheckInData({
                          ...checkInData,
                          smokedToday: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="smoke" className="cursor-pointer text-sm">
                      Did you smoke today? 🚬 (Just tracking!)
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="journal">Anything else on your mind?</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Optional. Write down how you&apos;re feeling. This stays
                    private.
                  </p>
                  <Textarea
                    id="journal"
                    placeholder="E.g., Had a long day in traffic... feeling tired but okay."
                    value={checkInData.journal}
                    onChange={(e) =>
                      setCheckInData({
                        ...checkInData,
                        journal: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs text-emerald-800">
                    🔒 Everything you share is encrypted and private. We never
                    share your data.
                  </p>
                  <p className="text-xs text-emerald-700 mt-1 font-semibold">
                    +15 points for completing your daily check-in! 🎉
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setStep(4)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black py-8 rounded-[2rem] shadow-2xl shadow-emerald-100 transition-all hover:scale-[1.03] active:scale-[0.97] text-xl uppercase tracking-[0.15em] relative overflow-hidden group border-none disabled:opacity-80"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Analyzing Patterns...
                        </>
                      ) : (
                        <>
                          Secure Finish
                          <Sparkles className="w-6 h-6 fill-white" />
                        </>
                      )}
                    </span>
                    {!isSubmitting && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
