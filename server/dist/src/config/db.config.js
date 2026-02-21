"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_config_1 = require("./app.config");
let isConnected = false;
const connectToDatabase = async () => {
    if (isConnected || mongoose_1.default.connection.readyState === 1) {
        console.log("Using existing MongoDB connection");
        return;
    }
    try {
        const options = {};
        if (app_config_1.appConfig.db.username && app_config_1.appConfig.db.password) {
            options.user = app_config_1.appConfig.db.username;
            options.pass = app_config_1.appConfig.db.password;
        }
        await mongoose_1.default.connect(app_config_1.appConfig.db.url, options);
        isConnected = true;
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("MongoDB Connection Error:", error);
        throw error; // Let the caller handle it — process.exit() crashes serverless functions
    }
};
exports.default = connectToDatabase;
