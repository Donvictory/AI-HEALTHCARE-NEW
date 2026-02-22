"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoringLogic = exports.NOMINAL_HEALTH_PARAMS = void 0;
const daily_check_in_entity_1 = require("../modules/daily-check-in/daily-check-in.entity");
exports.NOMINAL_HEALTH_PARAMS = {
    hoursSlept: 8,
    stressLevel: 3, // out of 10 (lower is better)
    currentMood: 7, // out of 10 (higher is better)
    dailyActivityMeasure: 60, // minutes
    numOfWaterGlasses: 8,
};
exports.scoringLogic = {
    hoursSlept: (h) => {
        // 8h is optimal. Each hour diff is ~12.5% penalty.
        const diff = Math.abs(h - exports.NOMINAL_HEALTH_PARAMS.hoursSlept);
        const score = 100 - diff * 12.5;
        return Math.max(0, Math.min(100, score));
    },
    stressLevel: (s) => {
        // 1-10. 1 is best, 10 is worst.
        // Score = (11 - s) / 10 * 100? No, let's keep it simple: 100 - (s-1)*11
        const score = 100 - (s - 1) * 11.1;
        return Math.max(0, score);
    },
    currentMood: (m) => {
        // 1-10. 10 is best.
        const score = (m / 10) * 100;
        return Math.max(0, score);
    },
    dailyActivity: (mins) => {
        const score = (mins / exports.NOMINAL_HEALTH_PARAMS.dailyActivityMeasure) * 100;
        return Math.min(100, score);
    },
    water: (glasses) => {
        const score = (glasses / exports.NOMINAL_HEALTH_PARAMS.numOfWaterGlasses) * 100;
        return Math.min(100, score);
    },
    healthStatus: (status) => {
        switch (status) {
            case daily_check_in_entity_1.CurrentHealthStatus.EXCELLENT:
                return 100;
            case daily_check_in_entity_1.CurrentHealthStatus.GOOD:
                return 80;
            case daily_check_in_entity_1.CurrentHealthStatus.FAIR:
                return 50;
            default:
                return 30; // Poor not in enum but fallback
        }
    },
    symptoms: (symptoms) => {
        // 20% penalty per symptom
        const penalty = symptoms.length * 20;
        return Math.max(0, 100 - penalty);
    },
    lifestyle: (checks) => {
        // 25% penalty per bad lifestyle check
        const penalty = checks.length * 25;
        return Math.max(0, 100 - penalty);
    },
};
