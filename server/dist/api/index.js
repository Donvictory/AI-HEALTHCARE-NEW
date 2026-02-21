"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../src/app"));
const db_config_1 = __importDefault(require("../src/config/db.config"));
let isDbConnected = false;
const initializeServices = async () => {
    if (!isDbConnected) {
        await (0, db_config_1.default)();
        isDbConnected = true;
    }
};
exports.default = async (req, res) => {
    try {
        await initializeServices();
        return (0, app_1.default)(req, res);
    }
    catch (error) {
        console.error("Serverless Function Error:", error);
        res
            .status(500)
            .json({ error: "Internal Server Error during initialization" });
    }
};
