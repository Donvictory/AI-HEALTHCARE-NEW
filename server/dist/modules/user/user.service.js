"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crud_util_1 = require("../../utils/crud.util");
const user_model_1 = __importDefault(require("./user.model"));
const app_error_util_1 = require("../../utils/app-error.util");
const user_entity_1 = require("./user.entity");
const app_config_1 = require("../../config/app.config");
const daily_check_in_model_1 = __importDefault(require("../daily-check-in/daily-check-in.model"));
class UserService {
    repo;
    constructor() {
        this.repo = new crud_util_1.MongooseRepository(user_model_1.default);
    }
    // ─── Token Signing ──────────────────────────────────────────────────────────
    signAccessToken(id) {
        return jsonwebtoken_1.default.sign({ id }, app_config_1.appConfig.jwt.accessSecret, {
            expiresIn: app_config_1.appConfig.jwt
                .accessTokenExpiresIn,
        });
    }
    signRefreshToken(id) {
        return jsonwebtoken_1.default.sign({ id }, app_config_1.appConfig.jwt.refreshSecret, {
            expiresIn: app_config_1.appConfig.jwt
                .refreshTokenExpiresIn,
        });
    }
    signTokenPair(id) {
        return {
            accessToken: this.signAccessToken(id),
            refreshToken: this.signRefreshToken(id),
        };
    }
    // ─── Auth Methods ───────────────────────────────────────────────────────────
    async registerUser(data) {
        const existing = await this.repo.findOne({ email: data.email });
        if (existing)
            throw new app_error_util_1.AppError("Email already in use", 400);
        const newUser = await user_model_1.default.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || user_entity_1.UserRole.USER,
        });
        const tokens = this.signTokenPair(newUser._id.toString());
        return { user: newUser, ...tokens };
    }
    async loginUser(data) {
        const user = await user_model_1.default.findOne({ email: data.email }).select("+password");
        if (!user || !(await user.correctPassword(data.password))) {
            throw new app_error_util_1.AppError("Incorrect email or password", 401);
        }
        const tokens = this.signTokenPair(user._id.toString());
        // If it's the first login, mark it as false in the DB for future logins,
        // but keep it true in this response so the current session can proceed to onboarding.
        if (user.isFirstLogin) {
            await user_model_1.default.findByIdAndUpdate(user._id, { isFirstLogin: false });
        }
        return { user, ...tokens };
    }
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, app_config_1.appConfig.jwt.refreshSecret);
            const user = await this.repo.findById(decoded.id);
            if (!user || !user.isActive) {
                throw new app_error_util_1.AppError("User no longer exists or is inactive", 401);
            }
            const accessToken = this.signAccessToken(decoded.id);
            return { accessToken };
        }
        catch (err) {
            if (err instanceof app_error_util_1.AppError)
                throw err;
            throw new app_error_util_1.AppError("Invalid or expired refresh token", 401);
        }
    }
    // ─── User Methods ───────────────────────────────────────────────────────────
    async getEnrichedProfile(userId) {
        const user = await user_model_1.default.findById(userId).lean();
        if (!user)
            throw new app_error_util_1.AppError("User not found", 404);
        // Calculate BMI
        let bmi = 0;
        let bmiCategory = "Unknown";
        if (user.height && user.weight) {
            // height in cm, weight in kg. BMI = kg / m^2
            const heightInMeters = user.height / 100;
            bmi = parseFloat((user.weight / (heightInMeters * heightInMeters)).toFixed(1));
            if (bmi < 18.5)
                bmiCategory = "Underweight";
            else if (bmi < 25)
                bmiCategory = "Normal weight";
            else if (bmi < 30)
                bmiCategory = "Overweight";
            else
                bmiCategory = "Obese";
        }
        // Count check-ins
        const totalCheckIns = await daily_check_in_model_1.default.countDocuments({ userId });
        return {
            user,
            stats: {
                totalCheckIns,
                bmi,
                bmiCategory,
                healthPoints: user.healthPoints || 0,
                age: user.age,
            },
        };
    }
    async getAllUsers() {
        return this.repo.findMany({});
    }
    async getUserById(id) {
        const user = await this.repo.findById(id);
        if (!user)
            throw new app_error_util_1.AppError("User not found", 404);
        return user;
    }
    async updateUserById(id, updateData) {
        const updatedUser = await this.repo.updateById(id, updateData);
        if (!updatedUser)
            throw new app_error_util_1.AppError("User not found", 404);
        return updatedUser;
    }
    async onboardUser(id, onboardData) {
        const updatedUser = await this.repo.updateById(id, {
            ...onboardData,
            isOnboarded: true,
            isFirstLogin: false,
        });
        if (!updatedUser)
            throw new app_error_util_1.AppError("User not found", 404);
        return updatedUser;
    }
    async deleteUserById(id) {
        // 1. Delete all associated check-ins
        await daily_check_in_model_1.default.deleteMany({ userId: id });
        // 2. Delete the user
        const deletedUser = await user_model_1.default.findByIdAndDelete(id);
        if (!deletedUser)
            throw new app_error_util_1.AppError("User not found", 404);
        return true;
    }
}
exports.UserService = UserService;
