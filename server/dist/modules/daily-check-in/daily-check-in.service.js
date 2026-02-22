"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCheckInService = void 0;
const crud_util_1 = require("../../utils/crud.util");
const daily_check_in_model_1 = __importDefault(require("./daily-check-in.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const health_util_1 = require("../../utils/health.util");
const app_error_util_1 = require("../../utils/app-error.util");
class DailyCheckInService {
    repo;
    constructor() {
        this.repo = new crud_util_1.MongooseRepository(daily_check_in_model_1.default);
    }
    async create(userId, data) {
        const checkIn = await daily_check_in_model_1.default.create({ ...data, userId });
        // Calculate resilience score for this check-in
        const { resilience } = (0, health_util_1.calculateResilience)(checkIn);
        // Update user: award points, mark check-in done
        await user_model_1.default.findByIdAndUpdate(userId, {
            $inc: { healthPoints: resilience },
            hasCompletedDailyChecks: true,
        });
        return checkIn;
    }
    async getAll(userId) {
        return daily_check_in_model_1.default.find({ userId }).sort({ createdAt: -1 }).lean();
    }
    async getById(id, userId) {
        const checkIn = await this.repo.findOne({ _id: id, userId });
        if (!checkIn)
            throw new app_error_util_1.AppError("Daily check-in not found", 404);
        return checkIn;
    }
    async getToday(userId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        return daily_check_in_model_1.default.findOne({
            userId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        });
    }
    async update(id, userId, data) {
        const existing = await this.repo.findOne({ _id: id, userId });
        if (!existing)
            throw new app_error_util_1.AppError("Daily check-in not found", 404);
        const updated = await this.repo.updateById(id, data);
        return updated;
    }
    async delete(id, userId) {
        const existing = await this.repo.findOne({ _id: id, userId });
        if (!existing)
            throw new app_error_util_1.AppError("Daily check-in not found", 404);
        await this.repo.deleteById(id);
    }
}
exports.DailyCheckInService = DailyCheckInService;
