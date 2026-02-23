import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get("/", protect, controller.getMetrics.bind(controller));
router.get("/fhir", protect, controller.exportFHIR.bind(controller));
router.get("/sbar", protect, controller.getSBARReport.bind(controller));

export default router;
