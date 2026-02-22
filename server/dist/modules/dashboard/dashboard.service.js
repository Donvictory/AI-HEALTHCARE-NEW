"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const daily_check_in_model_1 = __importDefault(require("../daily-check-in/daily-check-in.model"));
const health_util_1 = require("../../utils/health.util");
class DashboardService {
    async getDashboardMetrics(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Find today's check-in
        const checkIn = await daily_check_in_model_1.default.findOne({
            userId,
            createdAt: { $gte: today },
        }).lean();
        if (!checkIn) {
            return {
                hasCheckedInToday: false,
                resilience: 0,
                driftLevel: "OPTIMAL", // Start at optimal by default or maybe "UNKNOWN"
                metrics: null,
            };
        }
        // Calculate metrics using utility
        const { resilience, driftLevel, breakdown } = (0, health_util_1.calculateResilience)(checkIn);
        return {
            hasCheckedInToday: true,
            resilience,
            driftLevel,
            radarData: [
                { subject: "Sleep", A: breakdown.sleep, fullMark: 100 },
                { subject: "Mood", A: breakdown.mood, fullMark: 100 },
                { subject: "Activity", A: breakdown.activity, fullMark: 100 },
                { subject: "Hydration", A: breakdown.water, fullMark: 100 },
                { subject: "Low Stress", A: breakdown.stress, fullMark: 100 },
            ],
            breakdown,
        };
    }
}
exports.DashboardService = DashboardService;
