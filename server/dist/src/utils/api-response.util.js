"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = exports.ApiResponse = void 0;
class ApiResponse {
    statusCode;
    data;
    message;
    success;
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
exports.ApiResponse = ApiResponse;
const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, data, message));
};
exports.sendSuccess = sendSuccess;
