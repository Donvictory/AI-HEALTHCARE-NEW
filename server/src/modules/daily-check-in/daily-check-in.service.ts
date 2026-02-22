import { MongooseRepository } from "../../utils/crud.util";
import DailyCheckInModel, { IDailyCheckIn } from "./daily-check-in.model";
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
