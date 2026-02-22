"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const daily_reset_service_1 = require("../services/daily-reset.service");
const initCronJobs = () => {
    // schedule resetDailyChecks at 00:00 every day
    node_cron_1.default.schedule("0 0 * * *", async () => {
        await (0, daily_reset_service_1.resetDailyChecks)();
    });
    console.log("Cron jobs initialized.");
};
exports.initCronJobs = initCronJobs;
