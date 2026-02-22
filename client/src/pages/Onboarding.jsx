import { useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Button } from "../Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import { Checkbox } from "../Components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { saveUserProfile, calculateBMI, getUserAuth } from "../lib/storage";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useMe } from "../hooks/use-auth";

const nigerianStates = [
  "Lagos",
  "Abuja",
  "Kano",
  "Rivers",
  "Oyo",
  "Kaduna",
  "Ogun",
  "Anambra",
  "Delta",
  "Edo",
  "Enugu",
  "Imo",
  "Kwara",
  "Ondo",
  "Osun",
  "Plateau",
  "Bayelsa",
  "Cross River",
];

const commonConditions = [
  "None",
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Heart Disease",
  "Malaria (Recurring)",
  "Sickle Cell",
];

const familyHistoryOptions = [
  "None",
  "Hypertension",
  "Diabetes",
  "Heart Disease",
  "Stroke",
  "Cancer",
  "Sickle Cell",
];

export function Onboarding() {
  const { data: user } = useMe();
  console.log(user);

  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    city: "",
    state: "",
    phone: "",
    knownConditions: [],
    familyHistory: [],
  });

  const handleNext = () => {
    if (step === 1) {
      if (
        !formData.age ||
        !formData.gender ||
        !formData.height ||
        !formData.weight
      ) {
        toast.error("Please fill in all basic info");
        return;
      }
    }
    if (step === 2) {
      if (!formData.city || !formData.state) {
        toast.error("Please select your location");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleComplete = () => {
    const auth = getUserAuth();
    const bmi = calculateBMI(
      parseFloat(formData.weight),
      parseFloat(formData.height),
    );

    const profile = {
      name: auth?.name || "User",
      email: auth?.email || "",
      phone: formData.phone,
      age: parseInt(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      bmi,
      city: formData.city,
      state: formData.state,
      knownConditions: formData.knownConditions.filter((c) => c !== "None"),
      familyHistory: formData.familyHistory.filter((h) => h !== "None"),
      points: 0,
      createdAt: new Date().toISOString(),
    };

    saveUserProfile(profile);
    toast.success("Welcome to DriftCare! 🎉");
    navigate("/check-in");
  };

  const toggleCondition = (condition) => {
    setFormData((prev) => {
      let newConditions = [...prev.knownConditions];

      if (condition === "None") {
        newConditions = ["None"];
      } else {
        newConditions = newConditions.filter((c) => c !== "None");
        if (newConditions.includes(condition)) {
          newConditions = newConditions.filter((c) => c !== condition);
        } else {
          newConditions.push(condition);
        }
        if (newConditions.length === 0) {
          newConditions = ["None"];
        }
      }

      return { ...prev, knownConditions: newConditions };
    });
  };

  const toggleFamilyHistory = (item) => {
    setFormData((prev) => {
      let newHistory = [...prev.familyHistory];

      if (item === "None") {
        newHistory = ["None"];
      } else {
        newHistory = newHistory.filter((h) => h !== "None");
        if (newHistory.includes(item)) {
          newHistory = newHistory.filter((h) => h !== item);
        } else {
          newHistory.push(item);
        }
        if (newHistory.length === 0) {
          newHistory = ["None"];
        }
      }

      return { ...prev, familyHistory: newHistory };
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Heart className="w-16 h-16 text-emerald-600 fill-emerald-600" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to DriftCare NG</CardTitle>
          <CardDescription>
            Your trusted health companion. Let's get to know you a bit.
            <br />
            <span className="text-xs text-emerald-600">
              🔒 Your data is private and encrypted
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  Step 1 of 3
                </div>
              </div>

              <div>
                <Label htmlFor="age">How old are you?</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 28"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 170"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 75"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNext} className="w-full">
                Next
              </Button>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  Step 2 of 3
                </div>
              </div>

              <div>
                <Label htmlFor="state">Which state are you in?</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) =>
                    setFormData({ ...formData, state: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">City/Town</Label>
                <Input
                  id="city"
                  placeholder="e.g., Ikeja, Lekki, Wuse"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  We use this to provide local context (traffic, heat, etc.)
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 080 1234 5678"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
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

          {/* Step 3: Health History */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  Step 3 of 3
                </div>
              </div>

              <div>
                <Label>Any known health conditions?</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Select all that apply
                </p>
                <div className="space-y-2">
                  {commonConditions.map((condition) => (
                    <div key={condition} className="flex items-center gap-2">
                      <Checkbox
                        id={condition}
                        checked={formData.knownConditions.includes(condition)}
                        onCheckedChange={() => toggleCondition(condition)}
                      />
                      <Label htmlFor={condition} className="cursor-pointer">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Family health history?</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Anyone in your family have these?
                </p>
                <div className="space-y-2">
                  {familyHistoryOptions.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Checkbox
                        id={`family-${item}`}
                        checked={formData.familyHistory.includes(item)}
                        onCheckedChange={() => toggleFamilyHistory(item)}
                      />
                      <Label
                        htmlFor={`family-${item}`}
                        className="cursor-pointer"
                      >
                        {item}
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
                <Button onClick={handleComplete} className="flex-1">
                  Let's Go! 🚀
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
