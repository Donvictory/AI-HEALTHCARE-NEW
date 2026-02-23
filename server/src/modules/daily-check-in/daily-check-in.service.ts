import { MongooseRepository } from "../../utils/crud.util";
import DailyCheckInModel, { IDailyCheckIn } from "./daily-check-in.model";
import UserModel from "../user/user.model";
import { calculateResilience, calculateDrift } from "../../utils/health.util";
import { sendPushNotification } from "../../utils/push-notifications.util";
import { AppError } from "../../utils/app-error.util";
import {
  CreateDailyCheckInDto,
  UpdateDailyCheckInDto,
} from "./daily-check-in.dto";

export class DailyCheckInService {
  private repo: MongooseRepository<IDailyCheckIn>;

  constructor() {
    this.repo = new MongooseRepository<IDailyCheckIn>(DailyCheckInModel);
  }

  async create(
    userId: string,
    data: CreateDailyCheckInDto,
  ): Promise<IDailyCheckIn> {
    const checkIn = await DailyCheckInModel.create({ ...data, userId });

    // Calculate resilience score for this check-in
    const { resilience } = calculateResilience(checkIn as any);

    // Update user: award points, mark check-in done
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $inc: { healthPoints: resilience },
        hasCompletedDailyChecks: true,
      },
      { new: true },
    );

    // Get recent history for drift analysis
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCheckIns = await DailyCheckInModel.find({
      userId,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .lean();

    const baselineCheckIns = await DailyCheckInModel.find({ userId })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const drift = calculateDrift(
      recentCheckIns as any,
      baselineCheckIns as any,
    );

    if (drift > 10 && updatedUser) {
      const message =
        drift > 20
          ? "Critical health drift detected! Please check your dashboard for immediate recommendations. ⚠️"
          : "Concerning shift in your health patterns. Try to prioritize rest today. 🌿";

      await sendPushNotification(updatedUser as any, {
        title: "Health Alert: Pattern Shift",
        body: message,
        url: "/dashboard",
      });
    }

    return checkIn;
  }

  async getAll(userId: string): Promise<IDailyCheckIn[]> {
    return DailyCheckInModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }

  async getById(id: string, userId: string): Promise<IDailyCheckIn> {
    const checkIn = await this.repo.findOne({ _id: id, userId });
    if (!checkIn) throw new AppError("Daily check-in not found", 404);
    return checkIn;
  }

  async getToday(userId: string): Promise<IDailyCheckIn | null> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return DailyCheckInModel.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  async update(
    id: string,
    userId: string,
    data: UpdateDailyCheckInDto,
  ): Promise<IDailyCheckIn> {
    const existing = await this.repo.findOne({ _id: id, userId });
    if (!existing) throw new AppError("Daily check-in not found", 404);

    const updated = await this.repo.updateById(id, data);
    return updated!;
  }

  async delete(id: string, userId: string): Promise<void> {
    const existing = await this.repo.findOne({ _id: id, userId });
    if (!existing) throw new AppError("Daily check-in not found", 404);
    await this.repo.deleteById(id);
  }
}
