import { Request, Response, NextFunction } from "express";
import { ChatService } from "./chat.service";
import { catchAsync } from "../../utils/catch-async.util";
import { sendSuccess } from "../../utils/api-response.util";

const service = new ChatService();

export class ChatController {
  ask = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { message } = req.body;
    const responseMessage = await service.chatWithContext(req.user.id, message);

    sendSuccess(
      res,
      { reply: responseMessage },
      "Chat response generated",
      200,
    );
  });
}
