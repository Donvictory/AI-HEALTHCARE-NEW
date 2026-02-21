import jwt from "jsonwebtoken";
import { MongooseRepository } from "../../utils/crud.util";
import UserModel, { IUser } from "./user.model";
import { AppError } from "../../utils/app-error.util";
import { UserRole } from "./user.entity";
import { appConfig } from "../../config/app.config";
import { RegisterDto, LoginDto } from "./user.dto";

export class UserService {
  private repo: MongooseRepository<IUser>;

  constructor() {
    this.repo = new MongooseRepository<IUser>(UserModel);
  }

  // ─── Token Signing ──────────────────────────────────────────────────────────

  private signAccessToken(id: string): string {
    return jwt.sign({ id }, appConfig.jwt.accessSecret, {
      expiresIn: appConfig.jwt
        .accessTokenExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  private signRefreshToken(id: string): string {
    return jwt.sign({ id }, appConfig.jwt.refreshSecret, {
      expiresIn: appConfig.jwt
        .refreshTokenExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  private signTokenPair(id: string) {
    return {
      accessToken: this.signAccessToken(id),
      refreshToken: this.signRefreshToken(id),
    };
  }

  // ─── Auth Methods ───────────────────────────────────────────────────────────

  async registerUser(data: RegisterDto) {
    const existing = await this.repo.findOne({ email: data.email });
    if (existing) throw new AppError("Email already in use", 400);

    const newUser = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || UserRole.USER,
    });

    const tokens = this.signTokenPair(newUser._id!.toString());
    return { user: newUser, ...tokens };
  }

  async loginUser(data: LoginDto) {
    const user = await UserModel.findOne({ email: data.email }).select(
      "+password",
    );
    if (!user || !(await (user as any).correctPassword(data.password))) {
      throw new AppError("Incorrect email or password", 401);
    }

    const tokens = this.signTokenPair(user._id!.toString());
    return { user, ...tokens };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, appConfig.jwt.refreshSecret) as {
        id: string;
      };

      const user = await this.repo.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError("User no longer exists or is inactive", 401);
      }

      const accessToken = this.signAccessToken(decoded.id);
      return { accessToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  // ─── User Methods ───────────────────────────────────────────────────────────

  async getAllUsers() {
    return this.repo.findMany({});
  }

  async getUserById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateUserById(id: string, updateData: Partial<IUser>) {
    const updatedUser = await this.repo.updateById(id, updateData);
    if (!updatedUser) throw new AppError("User not found", 404);
    return updatedUser;
  }
}
