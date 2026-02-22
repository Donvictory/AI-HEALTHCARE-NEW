"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_config_1 = require("./app.config");
// Disable buffering so commands fail fast if DB is down
mongoose_1.default.set("bufferCommands", false);
let isConnected = false;
const connectToDatabase = async () => {
    if (isConnected || mongoose_1.default.connection.readyState === 1) {
        return;
    }
    const connectionPromise = (async () => {
        try {
            const options = {
                serverSelectionTimeoutMS: 2000, // 2 seconds
                connectTimeoutMS: 5000,
            };
            if (app_config_1.appConfig.db.username && app_config_1.appConfig.db.password) {
                options.user = app_config_1.appConfig.db.username;
                options.pass = app_config_1.appConfig.db.password;
            }
            await mongoose_1.default.connect(app_config_1.appConfig.db.url, options);
            isConnected = true;
            console.log("Connected to MongoDB");
        }
        catch (error) {
            console.error("MongoDB Connection Error (Will retry if needed):", error.message);
        }
    })();
    // Do not await so the server can start listening even if DB is down
    if (process.env.NODE_ENV === "development") {
        console.warn("Starting server without waiting for MongoDB connection...");
    }
    else {
        await connectionPromise;
    }
};
exports.default = connectToDatabase;
