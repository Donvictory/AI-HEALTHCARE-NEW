"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const daily_check_in_entity_1 = require("./daily-check-in.entity");
const DailyCheckInSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true,
    },
    // Step 1: Sleep & Energy
    hoursSlept: { type: Number, required: true, min: 0, max: 24 },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    currentMood: { type: Number, required: true, min: 1, max: 10 },
    // Step 2: Movement & Water
    dailyActivityMeasure: { type: Number, required: true, min: 0 },
    numOfWaterGlasses: { type: Number, required: true, min: 0 },
    // Step 3: Health Status
    currentHealthStatus: {
        type: String,
        enum: Object.values(daily_check_in_entity_1.CurrentHealthStatus),
        required: true,
    },
    symptomsToday: [
        {
            type: String,
            enum: Object.values(daily_check_in_entity_1.Symptom),
        },
    ],
    // Step 4: Medical Reports (optional)
    medicalReports: [{ type: String }],
    feelingAboutReport: { type: String },
    // Step 5: Final Questions
    lifestyleChecks: [
        {
            type: String,
            enum: Object.values(daily_check_in_entity_1.LifestyleCheck),
        },
    ],
    anythingElse: { type: String },
}, { timestamps: true });
// One check-in per user per day
DailyCheckInSchema.index({ userId: 1, createdAt: 1 });
const DailyCheckInModel = mongoose_1.default.model("DailyCheckIn", DailyCheckInSchema);
exports.default = DailyCheckInModel;
