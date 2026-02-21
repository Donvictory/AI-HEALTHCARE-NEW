"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const app_config_1 = require("./config/app.config");
const db_config_1 = __importDefault(require("./config/db.config"));
const PORT = app_config_1.appConfig.port;
const startServer = async () => {
    try {
        await (0, db_config_1.default)();
        // await connectRedis();
        app_1.default.listen(PORT, () => {
            console.log(`Server running in ${app_config_1.appConfig.env} mode on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
