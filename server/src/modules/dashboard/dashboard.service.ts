import DailyCheckInModel from "../daily-check-in/daily-check-in.model";
import UserModel from "../user/user.model";
import { calculateResilience } from "../../utils/health.util";
import { scoringLogic } from "../../config/health-params.config";

export class DashboardService {
  async getDashboardMetrics(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's check-in
    const checkIn = await DailyCheckInModel.findOne({
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
    const { resilience, driftLevel, breakdown } = calculateResilience(
      checkIn as any,
    );

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
