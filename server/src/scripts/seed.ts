import "dotenv/config";
import connectToDatabase from "../config/db.config";
import { MongooseRepository } from "../utils/crud.util";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "../modules/user/user.model";
import { generateUsers } from "./seeding/users.seeder";

const seedData = async () => {
  try {
    await connectToDatabase();
    console.log("Database connected for seeding.");

    const userRepo = new MongooseRepository<IUser>(UserModel);

    // 1. Clear Data
    console.log("Clearing old data...");
    await userRepo.deleteMany({});

    // 2. Generate Data
    console.log("Generating users...");
    const hashedPw = await bcrypt.hash("admin123", 10);

    // Generate 20 users (including super_admin, admin, doctor, patient)
    await generateUsers(20, userRepo, hashedPw);

    console.log("✅ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
