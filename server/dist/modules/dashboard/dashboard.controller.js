"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const service = new dashboard_service_1.DashboardService();
class DashboardController {
    getMetrics = (0, catch_async_util_1.catchAsync)(async (req, res) => {
        const metrics = await service.getDashboardMetrics(req.user.id);
        (0, api_response_util_1.sendSuccess)(res, metrics, "Dashboard metrics retrieved");
    });
}
exports.DashboardController = DashboardController;
