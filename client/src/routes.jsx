import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/SignUp";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { DailyCheckIn } from "./pages/DailyCheckIn";
import { Profile } from "./pages/Profile";
import { EditProfile } from "./pages/EditProfile";
import { DoctorFinder } from "./pages/DoctorFinder";
import { HealthChat } from "./pages/HealthChat";
import { NotFound } from "./pages/NotFound";
import { Layout } from "./Components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "onboarding", element: <Onboarding /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "check-in", element: <DailyCheckIn /> },
      { path: "profile", element: <Profile /> },
      { path: "edit-profile", element: <EditProfile /> },
      { path: "find-doctor", element: <DoctorFinder /> },
      { path: "health-chat", element: <HealthChat /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
