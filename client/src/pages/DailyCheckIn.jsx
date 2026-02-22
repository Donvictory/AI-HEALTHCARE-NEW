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
    <div className="min-h-screen bg-[#fafbfc] flex flex-col items-center justify-center p-4 md:p-8 pb-32">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">
              Daily Check-In
            </span>
            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Step {step} of 5
            </span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              className="h-full bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.3)] transition-all duration-500"
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 md:p-12">
              {/* Step 1: Sleep & Energy (Merged Stress/Mood) */}
              {step === 1 && (
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm">
                      <Heart className="w-8 h-8 fill-emerald-600" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      Sleep & Energy
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-gray-400 italic">
                      Just between me and you. No judgment, just tracking. 💚
                    </CardDescription>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          How many hours did you sleep last night?
                        </Label>
                        <span className="text-2xl font-black text-indigo-600">
                          {checkInData.hoursSlept}h
                        </span>
                      </div>
                      <Slider
                        value={[checkInData.hoursSlept]}
                        onValueChange={([value]) =>
                          setCheckInData({ ...checkInData, hoursSlept: value })
                        }
                        min={0}
                        max={14}
                        step={0.5}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          How's your stress level today?
                        </Label>
                        <span className="text-2xl font-black text-purple-600">
                          {checkInData.stressLevel}/10
                        </span>
                      </div>
                      <Slider
                        value={[checkInData.stressLevel]}
                        onValueChange={([value]) =>
                          setCheckInData({ ...checkInData, stressLevel: value })
                        }
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          How's your mood right now?
                        </Label>
                        <span className="text-2xl font-black text-yellow-500">
                          {checkInData.mood}/10
                        </span>
                      </div>
                      <Slider
                        value={[checkInData.mood]}
                        onValueChange={([value]) =>
                          setCheckInData({ ...checkInData, mood: value })
                        }
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full h-16 rounded-2xl bg-gray-900 text-white font-bold text-lg transition-transform active:scale-95 shadow-xl shadow-gray-200"
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Step 2: Movement & Water */}
              {step === 2 && (
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <div className="bg-orange-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-600 shadow-sm">
                      <Dumbbell className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      Movement & Water
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-gray-400">
                      Walking, gym, dancing, anything counts!
                    </CardDescription>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                          Did you move your body today?
                        </Label>
                        <span className="text-2xl font-black text-orange-600">
                          {checkInData.physicalActivity} min
                        </span>
                      </div>
                      <Slider
                        value={[checkInData.physicalActivity]}
                        onValueChange={([value]) =>
                          setCheckInData({
                            ...checkInData,
                            physicalActivity: value,
                          })
                        }
                        min={0}
                        max={180}
                        step={5}
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                        How many glasses of water today?
                      </Label>
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                          <button
                            key={num}
                            onClick={() =>
                              setCheckInData({
                                ...checkInData,
                                waterIntake: num,
                              })
                            }
                            className={`h-12 rounded-xl border-2 flex items-center justify-center font-black transition-all ${
                              checkInData.waterIntake >= num
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                                : "bg-white border-gray-100 text-gray-300 hover:border-blue-200"
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl border-2 font-bold uppercase tracking-widest text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-[2] h-16 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Health Status & Symptoms */}
              {step === 3 && (
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <div className="bg-red-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-sm">
                      <Activity className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      Health Status & Symptoms
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-gray-400">
                      Select all that apply. If nothing, just tick "None"
                    </CardDescription>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {symptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          checkInData.symptoms.includes(symptom)
                            ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                            : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checkInData.symptoms.includes(symptom)}
                            className="w-5 h-5 rounded-md"
                          />
                          <span className="font-bold text-sm">{symptom}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                      How would you describe your current health status?
                    </Label>
                    <Select
                      value={checkInData.healthStatus}
                      onValueChange={(v) =>
                        setCheckInData({ ...checkInData, healthStatus: v })
                      }
                    >
                      <SelectTrigger className="h-14 rounded-xl border-2 font-bold px-6">
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

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl border-2 font-bold uppercase tracking-widest text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-[2] h-16 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Medical Reports (Optional) */}
              {step === 4 && (
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <div className="bg-emerald-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm">
                      <FileText className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      Medical Reports (Optional)
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-gray-400">
                      PDF, JPG, or PNG (Max 5MB)
                    </CardDescription>
                  </div>

                  <div
                    className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${uploadedFile ? "bg-emerald-50 border-emerald-300" : "bg-gray-50 border-gray-200"}`}
                  >
                    <input
                      id="fileUpload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <Upload
                        className={`w-10 h-10 mx-auto mb-4 ${uploadedFile ? "text-emerald-600" : "text-gray-400"}`}
                      />
                      <p className="font-black text-gray-900 tracking-tight">
                        {uploadedFile ? uploadedFile.name : "Click to upload"}
                      </p>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                      Your feelings about the report
                    </Label>
                    <Textarea
                      placeholder="E.g., My blood pressure reading was a bit high, feeling worried..."
                      className="rounded-2xl border-2 p-4 font-medium min-h-[120px]"
                      value={checkInData.reportNotes}
                      onChange={(e) =>
                        setCheckInData({
                          ...checkInData,
                          reportNotes: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl border-2 font-bold uppercase tracking-widest text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-[2] h-16 rounded-2xl bg-gray-900 text-white font-bold text-lg shadow-xl shadow-gray-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Final Questions */}
              {step === 5 && (
                <div className="space-y-10">
                  <div className="text-center space-y-2">
                    <div className="bg-blue-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-sm">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      Final Questions
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-gray-400">
                      Just between me and you. No judgment, just tracking. 💚
                    </CardDescription>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4 border border-gray-100">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        Quick lifestyle checks (optional)
                      </Label>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checkInData.drinkAlcohol}
                            onCheckedChange={(v) =>
                              setCheckInData({
                                ...checkInData,
                                drinkAlcohol: !!v,
                              })
                            }
                            className="w-6 h-6 rounded-lg"
                            id="alc"
                          />
                          <Label
                            htmlFor="alc"
                            className="font-bold text-sm text-gray-600 cursor-pointer"
                          >
                            Had a drink last night? 🥂
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={checkInData.smokedToday}
                            onCheckedChange={(v) =>
                              setCheckInData({
                                ...checkInData,
                                smokedToday: !!v,
                              })
                            }
                            className="w-6 h-6 rounded-lg"
                            id="smk"
                          />
                          <Label
                            htmlFor="smk"
                            className="font-bold text-sm text-gray-600 cursor-pointer"
                          >
                            Did you smoke today? 🚬
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-sm font-black text-gray-400 uppercase tracking-widest">
                        Anything else on your mind?
                      </Label>
                      <Textarea
                        placeholder="Optional. Write down how you're feeling. This stays private."
                        className="rounded-2xl border-2 p-4 font-medium min-h-[140px]"
                        value={checkInData.journal}
                        onChange={(e) =>
                          setCheckInData({
                            ...checkInData,
                            journal: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(4)}
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl border-2 font-bold uppercase tracking-widest text-xs"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      disabled={isSubmitting}
                      className="flex-[2] h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-lg shadow-2xl shadow-emerald-100 transition-all active:scale-95 uppercase tracking-widest"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="animate-pulse">Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Secure Finish
                          <Sparkles className="w-5 h-5 fill-white" />
                        </div>
                      )}
                    </Button>
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
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
