"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const doctor_service_1 = require("./doctor.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const app_error_util_1 = require("../../utils/app-error.util");
const user_model_1 = __importDefault(require("../user/user.model"));
const service = new doctor_service_1.DoctorService();
class DoctorController {
    // ─── Public / User ────────────────────────────────────────────────────────
    /**
     * GET /api/v1/doctors/nearby
     * Returns available doctors in the authenticated user's city, then falls
     * back to state-level if no city matches are found.
     */
    findNearby = (0, catch_async_util_1.catchAsync)(async (req, res, next) => {
        // Re-fetch user to get latest state/city from their profile
        const user = await user_model_1.default.findById(req.user.id).lean();
        if (!user)
            return next(new app_error_util_1.AppError("User not found", 404));
        if (!user.state)
            return next(new app_error_util_1.AppError("Please update your profile with your state to find nearby doctors.", 400));
        const specialty = req.query.specialty;
        const doctors = await service.findNearby(user.state, user.city, specialty);
        (0, api_response_util_1.sendSuccess)(res, {
            results: doctors.length,
            location: { state: user.state, city: user.city },
            doctors,
        }, "Nearby doctors retrieved", 200);
    });
    /**
     * GET /api/v1/doctors — all doctors with optional ?state &city &specialty &isAvailable
     */
    getAll = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const { state, city, specialty, isAvailable } = req.query;
        const doctors = await service.getAll({
            state,
            city,
            specialty,
            isAvailable,
        });
        (0, api_response_util_1.sendSuccess)(res, { results: doctors.length, doctors }, "Doctors retrieved", 200);
    });
    getById = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const doctor = await service.getById(req.params.id);
        (0, api_response_util_1.sendSuccess)(res, { doctor }, "Doctor retrieved", 200);
    });
    // ─── Admin ────────────────────────────────────────────────────────────────
    create = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const doctor = await service.create(req.body);
        (0, api_response_util_1.sendSuccess)(res, { doctor }, "Doctor created successfully", 201);
    });
    update = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const doctor = await service.update(req.params.id, req.body);
        (0, api_response_util_1.sendSuccess)(res, { doctor }, "Doctor updated successfully", 200);
    });
    delete = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        await service.delete(req.params.id);
        (0, api_response_util_1.sendSuccess)(res, null, "Doctor deleted successfully", 200);
    });
}
exports.DoctorController = DoctorController;
