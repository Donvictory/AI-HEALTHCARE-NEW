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
const doctor_entity_1 = require("./doctor.entity");
const DoctorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, lowercase: true },
    phone: { type: String },
    specialty: {
        type: String,
        enum: Object.values(doctor_entity_1.Specialty),
        required: true,
    },
    hospitalOrClinic: { type: String, required: true },
    bio: { type: String },
    profileImage: { type: String },
    // Location
    state: { type: String, required: true, lowercase: true },
    city: { type: String, required: true, lowercase: true },
    address: { type: String },
    // Profile details
    yearsOfExperience: { type: Number, min: 0 },
    consultationFee: { type: Number, min: 0 },
    rating: { type: Number, min: 0, max: 5 },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });
// Index for fast location-based lookups
DoctorSchema.index({ state: 1, city: 1 });
DoctorSchema.index({ specialty: 1 });
const DoctorModel = mongoose_1.default.model("Doctor", DoctorSchema);
exports.default = DoctorModel;
