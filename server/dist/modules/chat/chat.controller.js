"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_service_1 = require("./chat.service");
const catch_async_util_1 = require("../../utils/catch-async.util");
const api_response_util_1 = require("../../utils/api-response.util");
const service = new chat_service_1.ChatService();
class ChatController {
    ask = (0, catch_async_util_1.catchAsync)(async (req, res, _next) => {
        const { message } = req.body;
        const responseMessage = await service.chatWithContext(req.user.id, message);
        (0, api_response_util_1.sendSuccess)(res, { reply: responseMessage }, "Chat response generated", 200);
    });
}
exports.ChatController = ChatController;
