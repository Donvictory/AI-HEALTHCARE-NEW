import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../Components/ui/card";
import { Checkbox } from "../Components/ui/checkbox";
import { Label } from "../Components/ui/label";
import { Textarea } from "../Components/ui/textarea";
import { toast } from "sonner";
import { Heart, Activity, Brain, Moon, Sun } from "lucide-react";
import { saveDailyCheckIn } from "../lib/storage";

export function DailyCheckIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mood: 3,
    energy: 3,
    sleep: 7,
    water: 4,
    stress: 3,
    exercise: false,
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveDailyCheckIn(formData);
    toast.success("Daily check-in saved! Keep up the great work.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <header className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-900 italic">
            Daily Health Check-in
          </h1>
          <p className="text-gray-500 text-sm">How are you feeling today?</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600" />
                Mental & Physical State
              </CardTitle>
              <CardDescription>Rate your levels from 1-5</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mood</Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.mood}
                  onChange={(e) =>
                    setFormData({ ...formData, mood: parseInt(e.target.value) })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Energy Level</Label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.energy}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      energy: parseInt(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Vitals & Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-emerald-600" />
                  <Label>Did you exercise today?</Label>
                </div>
                <Checkbox
                  checked={formData.exercise}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, exercise: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Water Intake (Glasses)</Label>
                <input
                  type="number"
                  value={formData.water}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      water: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label>Any additional notes?</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="How's your day been?"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold italic bg-emerald-600 hover:bg-emerald-700"
          >
            Submit Check-in
          </Button>
        </form>
      </div>
    </div>
  );
}
