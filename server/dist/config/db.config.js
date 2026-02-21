"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_config_1 = __importDefault(require("../config/app.config"));
const connectToDatabase = async () => {
    try {
        const options = {};
        if (app_config_1.default.db.username && app_config_1.default.db.password) {
            options.user = app_config_1.default.db.username;
            options.pass = app_config_1.default.db.password;
        }
        await mongoose_1.default.connect(app_config_1.default.db.url, options);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};
exports.default = connectToDatabase;
