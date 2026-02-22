"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateResilience = calculateResilience;
const health_params_config_1 = require("../config/health-params.config");
function calculateResilience(checkIn) {
    if (!checkIn)
        return { resilience: 0, breakdown: {} };
    const sleepScore = health_params_config_1.scoringLogic.hoursSlept(checkIn.hoursSlept || 0);
    const stressScore = health_params_config_1.scoringLogic.stressLevel(checkIn.stressLevel || 5);
    const moodScore = health_params_config_1.scoringLogic.currentMood(checkIn.currentMood || 5);
    const activityScore = health_params_config_1.scoringLogic.dailyActivity(checkIn.dailyActivityMeasure || 0);
    const waterScore = health_params_config_1.scoringLogic.water(checkIn.numOfWaterGlasses || 0);
    const healthStatusScore = health_params_config_1.scoringLogic.healthStatus(checkIn.currentHealthStatus);
    const symptomsScore = health_params_config_1.scoringLogic.symptoms(checkIn.symptomsToday || []);
    const lifestyleScore = health_params_config_1.scoringLogic.lifestyle(checkIn.lifestyleChecks || []);
    const scores = [
        sleepScore,
        stressScore,
        moodScore,
        activityScore,
        waterScore,
        healthStatusScore,
        symptomsScore,
        lifestyleScore,
    ];
    const resilience = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    let driftLevel = "OPTIMAL";
    if (resilience < 40)
        driftLevel = "CRITICAL";
    else if (resilience < 60)
        driftLevel = "CONCERNING";
    else if (resilience < 80)
        driftLevel = "NOMINAL";
    return {
        resilience,
        driftLevel,
        breakdown: {
            sleep: Math.round(sleepScore),
            stress: Math.round(stressScore),
            mood: Math.round(moodScore),
            activity: Math.round(activityScore),
            water: Math.round(waterScore),
            healthStatus: Math.round(healthStatusScore),
            symptoms: Math.round(symptomsScore),
            lifestyle: Math.round(lifestyleScore),
        },
    };
}
