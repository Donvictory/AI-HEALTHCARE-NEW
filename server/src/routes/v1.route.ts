import express from "express";
import userRoutes from "../modules/user/user.route";
import mediaRoutes from "../modules/media/media.route";
import dailyCheckInRoutes from "../modules/daily-check-in/daily-check-in.route";
import doctorRoutes from "../modules/doctor/doctor.route";
import dashboardRoutes from "../modules/dashboard/dashboard.route";
import cronRoutes from "../modules/cron/cron.route";
import chatRoutes from "../modules/chat/chat.route";
import taskRoutes from "../modules/task/task.route";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/media", mediaRoutes);
router.use("/daily-check-ins", dailyCheckInRoutes);
router.use("/doctors", doctorRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/cron", cronRoutes);
router.use("/chat", chatRoutes);
router.use("/tasks", taskRoutes);

export default router;
