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
exports.DepositService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const wallet_entity_1 = require("../entities/wallet.entity");
const user_entity_1 = require("../entities/user.entity");
let DepositService = class DepositService {
    transactionRepository;
    walletRepository;
    userRepository;
    dataSource;
    constructor(transactionRepository, walletRepository, userRepository, dataSource) {
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
    }
    async createDepositRequest(userId, createDepositDto) {
        const { amount, description } = createDepositDto;
        const transaction = this.transactionRepository.create({
            type: transaction_entity_1.TransactionType.DEPOSIT,
            status: transaction_entity_1.TransactionStatus.PENDING,
            amount,
            description,
            userId,
        });
        const savedTransaction = await this.transactionRepository.save(transaction);
        return {
            id: savedTransaction.id,
            amount: savedTransaction.amount,
            description: savedTransaction.description,
            status: savedTransaction.status,
            createdAt: savedTransaction.createdAt,
        };
    }
    async getPendingDeposits() {
        const transactions = await this.transactionRepository.find({
            where: {
                type: transaction_entity_1.TransactionType.DEPOSIT,
                status: transaction_entity_1.TransactionStatus.PENDING
            },
            relations: ['user'],
            order: { createdAt: 'ASC' },
        });
        return transactions.map(transaction => ({
            id: transaction.id,
            amount: transaction.amount,
            description: transaction.description,
            userId: transaction.userId,
            user: {
                id: transaction.user.id,
                email: transaction.user.email,
                firstName: transaction.user.firstName,
                lastName: transaction.user.lastName,
            },
            createdAt: transaction.createdAt,
        }));
    }
    async approveDeposit(transactionId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const transaction = await queryRunner.manager.findOne(transaction_entity_1.Transaction, {
                where: {
                    id: transactionId,
                    type: transaction_entity_1.TransactionType.DEPOSIT,
                    status: transaction_entity_1.TransactionStatus.PENDING
                },
                relations: ['user'],
            });
            if (!transaction) {
                throw new common_1.NotFoundException('Pending deposit transaction not found');
            }
            let wallet = await queryRunner.manager.findOne(wallet_entity_1.Wallet, {
                where: { userId: transaction.userId },
            });
            if (!wallet) {
                wallet = queryRunner.manager.create(wallet_entity_1.Wallet, {
                    userId: transaction.userId,
                    balance: 0,
                });
                await queryRunner.manager.save(wallet);
            }
            transaction.status = transaction_entity_1.TransactionStatus.COMPLETED;
            await queryRunner.manager.save(transaction);
            wallet.balance = Number(wallet.balance) + Number(transaction.amount);
            await queryRunner.manager.save(wallet);
            await queryRunner.commitTransaction();
            return {
                message: 'Deposit approved successfully',
                transaction: {
                    id: transaction.id,
                    amount: transaction.amount,
                    status: transaction.status,
                    newBalance: wallet.balance,
                },
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getUserDeposits(userId) {
        const transactions = await this.transactionRepository.find({
            where: {
                userId,
                type: transaction_entity_1.TransactionType.DEPOSIT
            },
            order: { createdAt: 'DESC' },
        });
        return transactions.map(transaction => ({
            id: transaction.id,
            amount: transaction.amount,
            description: transaction.description,
            status: transaction.status,
            createdAt: transaction.createdAt,
        }));
    }
};
exports.DepositService = DepositService;
exports.DepositService = DepositService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], DepositService);
//# sourceMappingURL=deposit.service.js.map