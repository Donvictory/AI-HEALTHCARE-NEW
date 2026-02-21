import jwt from "jsonwebtoken";
import { MongooseRepository } from "../../utils/crud.util";
import UserModel, { IUser } from "./user.model";
import { AppError } from "../../utils/app-error.util";
import appConfig from "../../config/app.config";
import { UserRole } from "./user.entity";

export class UserService {
  private repo: MongooseRepository<IUser>;

  constructor() {
    this.repo = new MongooseRepository<IUser>(UserModel);
  }

  private signToken(id: string) {
    return jwt.sign({ id }, appConfig.jwt.accessSecret, {
      expiresIn: appConfig.jwt
        .accessTokenExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  async registerUser(data: Partial<IUser>) {
    // Check if user exists
    const existing = await this.repo.findOne({ email: data.email });
    if (existing) throw new AppError("Email already in use", 400);

    // Default role is USER if not provided
    const newUser = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
    });

    const token = this.signToken(newUser._id!.toString());
    return { user: newUser, token };
  }

  async loginUser(email: string, password: string) {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !(await (user as any).correctPassword(password))) {
      throw new AppError("Incorrect email or password", 401);
    }

    const token = this.signToken(user._id!.toString());
    return { user, token };
  }

  async getAllUsers() {
    return this.repo.findMany({});
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }
}
