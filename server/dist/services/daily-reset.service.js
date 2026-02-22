"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetDailyChecks = void 0;
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const resetDailyChecks = async () => {
    console.log("Running Daily Reset: resetting hasCompletedDailyChecks for all users...");
    try {
        const result = await user_model_1.default.updateMany({}, {
            hasCompletedDailyChecks: false,
            currentDailyCheckStep: 1,
        });
        console.log(`Daily reset complete. Updated ${result.modifiedCount} users.`);
        return result;
    }
    catch (error) {
        console.error("Error during daily reset:", error);
        throw error;
    }
};
exports.resetDailyChecks = resetDailyChecks;
