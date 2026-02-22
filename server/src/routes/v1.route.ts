import express from "express";
import userRoutes from "../modules/user/user.route";
import mediaRoutes from "../modules/media/media.route";
import dailyCheckInRoutes from "../modules/daily-check-in/daily-check-in.route";

const router = express.Router();

// Health check
router.get("/health", (_, res) => {
  res.status(200).json({ ok: true });
});

// Mount modules
router.use("/users", userRoutes);
router.use("/media", mediaRoutes);
router.use("/daily-check-ins", dailyCheckInRoutes);

export default router;
