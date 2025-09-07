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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const wallet_entity_1 = require("../entities/wallet.entity");
const user_entity_1 = require("../entities/user.entity");
let WalletService = class WalletService {
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
    async getBalance(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email', 'firstName', 'lastName'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        let wallet = await this.walletRepository.findOne({
            where: { userId },
        });
        if (!wallet) {
            wallet = this.walletRepository.create({
                userId,
                balance: 0,
            });
            wallet = await this.walletRepository.save(wallet);
        }
        return {
            balance: Number(wallet.balance),
            userId: wallet.userId,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
    async transferToUser(userId, transferDto) {
        const { recipientEmail, amount, description } = transferDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const recipient = await queryRunner.manager.findOne(user_entity_1.User, {
                where: { email: recipientEmail },
                select: ['id', 'email', 'firstName', 'lastName'],
            });
            if (!recipient) {
                throw new common_1.NotFoundException('Recipient user not found');
            }
            if (recipient.id === userId) {
                throw new common_1.BadRequestException('Cannot transfer to yourself');
            }
            let senderWallet = await queryRunner.manager.findOne(wallet_entity_1.Wallet, {
                where: { userId },
            });
            if (!senderWallet) {
                throw new common_1.NotFoundException('Sender wallet not found');
            }
            if (Number(senderWallet.balance) < amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            let recipientWallet = await queryRunner.manager.findOne(wallet_entity_1.Wallet, {
                where: { userId: recipient.id },
            });
            if (!recipientWallet) {
                recipientWallet = queryRunner.manager.create(wallet_entity_1.Wallet, {
                    userId: recipient.id,
                    balance: 0,
                });
                await queryRunner.manager.save(recipientWallet);
            }
            const transaction = queryRunner.manager.create(transaction_entity_1.Transaction, {
                type: transaction_entity_1.TransactionType.TRANSFER,
                status: transaction_entity_1.TransactionStatus.COMPLETED,
                amount,
                description,
                userId,
                recipientId: recipient.id,
            });
            const savedTransaction = await queryRunner.manager.save(transaction);
            senderWallet.balance = Number(senderWallet.balance) - amount;
            recipientWallet.balance = Number(recipientWallet.balance) + amount;
            await queryRunner.manager.save(senderWallet);
            await queryRunner.manager.save(recipientWallet);
            await queryRunner.commitTransaction();
            return {
                id: savedTransaction.id,
                amount: savedTransaction.amount,
                description: savedTransaction.description,
                status: savedTransaction.status,
                recipientId: savedTransaction.recipientId,
                recipient: {
                    id: recipient.id,
                    email: recipient.email,
                    firstName: recipient.firstName,
                    lastName: recipient.lastName,
                },
                createdAt: savedTransaction.createdAt,
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
    async payWithBalance(userId, payWithBalanceDto) {
        const { amount, description } = payWithBalanceDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let wallet = await queryRunner.manager.findOne(wallet_entity_1.Wallet, {
                where: { userId },
            });
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            if (Number(wallet.balance) < amount) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            const transaction = queryRunner.manager.create(transaction_entity_1.Transaction, {
                type: transaction_entity_1.TransactionType.PAYMENT,
                status: transaction_entity_1.TransactionStatus.COMPLETED,
                amount,
                description: description || 'Payment',
                userId,
            });
            const savedTransaction = await queryRunner.manager.save(transaction);
            wallet.balance = Number(wallet.balance) - amount;
            await queryRunner.manager.save(wallet);
            await queryRunner.commitTransaction();
            return {
                message: 'Payment completed successfully',
                transaction: {
                    id: savedTransaction.id,
                    amount: savedTransaction.amount,
                    description: savedTransaction.description,
                    status: savedTransaction.status,
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
    async getTransactionHistory(userId) {
        const transactions = await this.transactionRepository.find({
            where: { userId },
            relations: ['recipient'],
            order: { createdAt: 'DESC' },
        });
        return transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.type,
            status: transaction.status,
            amount: transaction.amount,
            description: transaction.description,
            recipientId: transaction.recipientId,
            recipient: transaction.recipient ? {
                id: transaction.recipient.id,
                email: transaction.recipient.email,
                firstName: transaction.recipient.firstName,
                lastName: transaction.recipient.lastName,
            } : undefined,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        }));
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], WalletService);
//# sourceMappingURL=wallet.service.js.map