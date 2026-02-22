"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyCheckInController = void 0;
const daily_check_in_service_1 = require("./daily-check-in.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const service = new daily_check_in_service_1.DailyCheckInService();
class DailyCheckInController {
    create = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const checkIn = await service.create(req.user.id, req.body);
        (0, api_response_util_1.sendSuccess)(res, { checkIn }, "Daily check-in submitted successfully", 201);
    });
    getAll = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const checkIns = await service.getAll(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, { results: checkIns.length, checkIns }, "Daily check-ins retrieved", 200);
    });
    getToday = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const checkIn = await service.getToday(req.user.id);
        if (!checkIn) {
            return (0, api_response_util_1.sendSuccess)(res, { checkIn: null }, "No check-in found for today", 200);
        }
        (0, api_response_util_1.sendSuccess)(res, { checkIn }, "Today's check-in retrieved", 200);
    });
    getById = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const checkIn = await service.getById(req.params.id, req.user.id);
        (0, api_response_util_1.sendSuccess)(res, { checkIn }, "Daily check-in retrieved", 200);
    });
    update = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const checkIn = await service.update(req.params.id, req.user.id, req.body);
        (0, api_response_util_1.sendSuccess)(res, { checkIn }, "Daily check-in updated successfully", 200);
    });
    delete = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        await service.delete(req.params.id, req.user.id);
        (0, api_response_util_1.sendSuccess)(res, null, "Daily check-in deleted", 200);
    });
}
exports.DailyCheckInController = DailyCheckInController;
