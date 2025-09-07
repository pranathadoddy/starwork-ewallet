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
exports.TransferResponseDto = exports.TransactionHistoryDto = exports.BalanceResponseDto = exports.PayWithBalanceDto = exports.TransferDto = void 0;
const class_validator_1 = require("class-validator");
class TransferDto {
    recipientEmail;
    amount;
    description;
}
exports.TransferDto = TransferDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], TransferDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], TransferDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransferDto.prototype, "description", void 0);
class PayWithBalanceDto {
    amount;
    description;
}
exports.PayWithBalanceDto = PayWithBalanceDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], PayWithBalanceDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PayWithBalanceDto.prototype, "description", void 0);
class BalanceResponseDto {
    balance;
    userId;
    user;
}
exports.BalanceResponseDto = BalanceResponseDto;
class TransactionHistoryDto {
    id;
    type;
    status;
    amount;
    description;
    recipientId;
    recipient;
    createdAt;
    updatedAt;
}
exports.TransactionHistoryDto = TransactionHistoryDto;
class TransferResponseDto {
    id;
    amount;
    description;
    status;
    recipientId;
    recipient;
    createdAt;
}
exports.TransferResponseDto = TransferResponseDto;
//# sourceMappingURL=wallet.dto.js.map