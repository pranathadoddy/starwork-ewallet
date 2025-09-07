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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const session_entity_1 = require("../entities/session.entity");
const user_entity_1 = require("../entities/user.entity");
let SessionService = class SessionService {
    sessionRepository;
    userRepository;
    constructor(sessionRepository, userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }
    async createSession(userId, token, deviceInfo, ipAddress) {
        await this.deactivateUserSessions(userId);
        const session = this.sessionRepository.create({
            userId,
            token,
            isActive: true,
            deviceInfo,
            ipAddress,
            lastUsedAt: new Date(),
        });
        return this.sessionRepository.save(session);
    }
    async deactivateUserSessions(userId) {
        await this.sessionRepository.update({ userId, isActive: true }, { isActive: false });
    }
    async validateSession(token) {
        const session = await this.sessionRepository.findOne({
            where: { token, isActive: true },
            relations: ['user'],
        });
        if (session) {
            session.lastUsedAt = new Date();
            await this.sessionRepository.save(session);
        }
        return session;
    }
    async deactivateSession(token) {
        await this.sessionRepository.update({ token }, { isActive: false });
    }
    async getUserActiveSessions(userId) {
        return this.sessionRepository.find({
            where: { userId, isActive: true },
            order: { lastUsedAt: 'DESC' },
        });
    }
    async cleanupExpiredSessions() {
        const expiredDate = new Date();
        expiredDate.setHours(expiredDate.getHours() - 24);
        await this.sessionRepository.update({
            isActive: true,
            lastUsedAt: { $lt: expiredDate }
        }, { isActive: false });
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SessionService);
//# sourceMappingURL=session.service.js.map