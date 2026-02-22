"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const app_config_1 = require("./config/app.config");
const db_config_1 = __importDefault(require("./config/db.config"));
const PORT = app_config_1.appConfig.port;
// ─── Local Development ───────────────────────────────────────────────────────
// Only start the HTTP server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== "1") {
    const startServer = async () => {
        try {
            await (0, db_config_1.default)();
            // await connectRedis();
            const { initCronJobs } = await Promise.resolve().then(() => __importStar(require("./cron/cron")));
            initCronJobs();
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
}
// ─── Vercel Serverless Handler ───────────────────────────────────────────────
// Vercel detects and calls this exported function for each request.
// express.json() in app.ts handles body parsing normally — no manipulation needed.
let isDbConnected = false;
const handler = async (req, res) => {
    if (!isDbConnected) {
        await (0, db_config_1.default)();
        isDbConnected = true;
    }
    return (0, app_1.default)(req, res);
};
exports.default = handler;
