"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_config_1 = __importDefault(require("../config/db.config"));
const crud_util_1 = require("../utils/crud.util");
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const users_seeder_1 = require("./seeding/users.seeder");
const seedData = async () => {
    try {
        await (0, db_config_1.default)();
        console.log("Database connected for seeding.");
        const userRepo = new crud_util_1.MongooseRepository(user_model_1.default);
        // 1. Clear Data
        console.log("Clearing old data...");
        await userRepo.deleteMany({});
        // 2. Generate Data
        console.log("Generating users...");
        const hashedPw = await bcrypt_1.default.hash("admin123", 10);
        // Generate 20 users (including super_admin, admin, doctor, patient)
        await (0, users_seeder_1.generateUsers)(20, userRepo, hashedPw);
        console.log("✅ Seeding complete!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding Error:", error);
        process.exit(1);
    }
};
seedData();
