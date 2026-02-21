import { useState, useEffect } from "react";
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
import {
  getUserProfile,
  getDailyCheckIns,
  getPoints,
  logout,
} from "../lib/storage";
import {
  User,
  MapPin,
  Activity,
  Calendar,
  Heart,
  Trash2,
  Shield,
  Edit,
  Award,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const userProfile = getUserProfile();
    const checkIns = getDailyCheckIns();
    const userPoints = getPoints();
    setProfile(userProfile);
    setTotalCheckIns(checkIns.length);
    setPoints(userPoints);
  }, []);

  const handleClearData = () => {
    localStorage.clear();
    toast.success("All data cleared. Redirecting...");
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* JSX below remains EXACTLY the same as your original */}
      </div>
    </div>
  );
}
