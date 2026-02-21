"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("../modules/user/user.route"));
const media_route_1 = __importDefault(require("../modules/media/media.route"));
const router = express_1.default.Router();
// Health check
router.get("/health", (_, res) => {
    res.status(200).json({ ok: true });
});
// Mount modules
router.use("/users", user_route_1.default);
router.use("/media", media_route_1.default);
exports.default = router;
