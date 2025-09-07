"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const session_service_1 = require("../session/session.service");
let AuthService = class AuthService {
    userService;
    jwtService;
    sessionService;
    constructor(userService, jwtService, sessionService) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.sessionService = sessionService;
    }
    async login(loginDto, deviceInfo, ipAddress) {
        const { email, password } = loginDto;
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.userService.validatePassword(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        const token = this.jwtService.sign(payload);
        await this.sessionService.createSession(user.id, token, deviceInfo, ipAddress);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token,
        };
    }
    async logout(token) {
        await this.sessionService.deactivateSession(token);
        return {
            message: 'Logged out successfully',
        };
    }
    async logoutAllSessions(userId) {
        await this.sessionService.deactivateUserSessions(userId);
        return {
            message: 'All sessions logged out successfully',
        };
    }
    async getActiveSessions(userId) {
        const sessions = await this.sessionService.getUserActiveSessions(userId);
        return sessions.map(session => ({
            id: session.id,
            deviceInfo: session.deviceInfo,
            ipAddress: session.ipAddress,
            lastUsedAt: session.lastUsedAt,
            createdAt: session.createdAt,
        }));
    }
    async createAdmin(email, password, firstName, lastName) {
        const existingAdmin = await this.userService.findByEmail(email);
        if (existingAdmin) {
            throw new common_1.ConflictException('Admin with this email already exists');
        }
        await this.userService.createAdmin(email, password, firstName, lastName);
        return {
            message: 'Admin created successfully',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService,
        session_service_1.SessionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map