"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crud_util_1 = require("../../utils/crud.util");
const user_model_1 = __importDefault(require("../../modules/user/user.model"));
const app_error_util_1 = require("../../utils/app-error.util");
const app_config_1 = __importDefault(require("../../config/app.config"));
const user_entity_1 = require("../../modules/user/user.entity");
class UserService {
    repo;
    constructor() {
        this.repo = new crud_util_1.MongooseRepository(user_model_1.default);
    }
    signToken(id) {
        return jsonwebtoken_1.default.sign({ id }, app_config_1.default.jwt.accessSecret, {
            expiresIn: app_config_1.default.jwt
                .accessTokenExpiresIn,
        });
    }
    async registerUser(data) {
        // Check if user exists
        const existing = await this.repo.findOne({ email: data.email });
        if (existing)
            throw new app_error_util_1.AppError("Email already in use", 400);
        // Default role is USER if not provided
        const newUser = await user_model_1.default.create({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role || user_entity_1.UserRole.USER,
        });
        const token = this.signToken(newUser._id.toString());
        return { user: newUser, token };
    }
    async loginUser(email, password) {
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user || !(await user.correctPassword(password))) {
            throw new app_error_util_1.AppError("Incorrect email or password", 401);
        }
        const token = this.signToken(user._id.toString());
        return { user, token };
    }
    async getAllUsers() {
        return this.repo.findMany({});
    }
    async getUserById(id) {
        const user = await this.repo.findById(id);
        if (!user)
            throw new app_error_util_1.AppError("User not found", 404);
        return user;
    }
}
exports.UserService = UserService;
