import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";
import { toast } from "sonner";
import { User, Mail, Shield, ChevronLeft } from "lucide-react";
import { getUserProfile, saveUserProfile } from "../lib/storage";

export function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getUserProfile());

  const handleSubmit = (e) => {
    e.preventDefault();
    saveUserProfile(profile);
    toast.success("Profile updated successfully!");
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, age: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={profile.gender || ""}
                  onValueChange={(val) =>
                    setProfile({ ...profile, gender: val })
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Health Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="healthCondition">Primary Health Goal</Label>
                <Input
                  id="healthGoal"
                  value={profile.healthGoal || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, healthGoal: e.target.value })
                  }
                  placeholder="e.g. Better sleep, more activity"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}
