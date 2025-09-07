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
var SeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeederService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
let SeederService = SeederService_1 = class SeederService {
    userService;
    logger = new common_1.Logger(SeederService_1.name);
    constructor(userService) {
        this.userService = userService;
    }
    async seedAdmin() {
        try {
            const existingAdmin = await this.userService.findByEmail('admin@ewallet.com');
            if (existingAdmin) {
                this.logger.log('Admin user already exists');
                return;
            }
            await this.userService.createAdmin('admin@ewallet.com', 'admin123', 'Admin', 'User');
            this.logger.log('Admin user created successfully');
        }
        catch (error) {
            this.logger.error('Error seeding admin user:', error);
        }
    }
};
exports.SeederService = SeederService;
exports.SeederService = SeederService = SeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService])
], SeederService);
//# sourceMappingURL=seeder.service.js.map