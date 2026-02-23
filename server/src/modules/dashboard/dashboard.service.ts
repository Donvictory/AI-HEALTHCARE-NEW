import DailyCheckInModel from "../daily-check-in/daily-check-in.model";
import UserModel from "../user/user.model";
import { calculateResilience, calculateDrift } from "../../utils/health.util";
import { mapToFHIR, generateSBAR } from "../../utils/interop.util";
import { AppError } from "../../utils/app-error.util";

export class DashboardService {
  async getDashboardMetrics(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const checkIn = await DailyCheckInModel.findOne({
      userId,
      createdAt: { $gte: today },
    }).lean();

    const recentCheckIns = await DailyCheckInModel.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .lean();

    const baselineCheckIns = await DailyCheckInModel.find({
      userId,
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const overallDrift = calculateDrift(recentCheckIns, baselineCheckIns);

    if (!checkIn) {
      return {
        hasCheckedInToday: false,
        resilience: 0,
        driftLevel: "OPTIMAL",
        overallDrift,
        metrics: null,
      };
    }

    const { resilience, driftLevel, breakdown } = calculateResilience(
      checkIn as any,
    );

    return {
      hasCheckedInToday: true,
      resilience,
      driftLevel,
      overallDrift,
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

  async getFHIRData(userId: string) {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new AppError("User not found", 404);

    const checkIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return mapToFHIR(user as any, checkIns as any);
  }

  async getSBARSummary(userId: string) {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new AppError("User not found", 404);

    const recentCheckIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const baselineCheckIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const drift = calculateDrift(recentCheckIns, baselineCheckIns);
    return generateSBAR(user as any, recentCheckIns as any, drift);
  }
}
