import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { TransferDto, PayWithBalanceDto, BalanceResponseDto, TransactionHistoryDto, TransferResponseDto } from '../dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async getBalance(userId: string): Promise<BalanceResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
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

  async transferToUser(userId: string, transferDto: TransferDto): Promise<TransferResponseDto> {
    const { recipientEmail, amount, description } = transferDto;

    // Use database transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find recipient user
      const recipient = await queryRunner.manager.findOne(User, {
        where: { email: recipientEmail },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!recipient) {
        throw new NotFoundException('Recipient user not found');
      }

      if (recipient.id === userId) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      // Get sender's wallet
      let senderWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
      });

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      // Check if sender has sufficient balance
      if (Number(senderWallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Get or create recipient's wallet
      let recipientWallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: recipient.id },
      });

      if (!recipientWallet) {
        recipientWallet = queryRunner.manager.create(Wallet, {
          userId: recipient.id,
          balance: 0,
        });
        await queryRunner.manager.save(recipientWallet);
      }

      // Create transfer transaction
      const transaction = queryRunner.manager.create(Transaction, {
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        amount,
        description,
        userId,
        recipientId: recipient.id,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update balances atomically
      senderWallet.balance = Number(senderWallet.balance) - amount;
      recipientWallet.balance = Number(recipientWallet.balance) + amount;

      await queryRunner.manager.save(senderWallet);
      await queryRunner.manager.save(recipientWallet);

      // Commit the transaction
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
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async payWithBalance(userId: string, payWithBalanceDto: PayWithBalanceDto): Promise<{ message: string; transaction: any }> {
    const { amount, description } = payWithBalanceDto;

    // Use database transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get user's wallet
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Check if user has sufficient balance
      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Create payment transaction
      const transaction = queryRunner.manager.create(Transaction, {
        type: TransactionType.PAYMENT,
        status: TransactionStatus.COMPLETED,
        amount,
        description: description || 'Payment',
        userId,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update wallet balance
      wallet.balance = Number(wallet.balance) - amount;
      await queryRunner.manager.save(wallet);

      // Commit the transaction
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
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getTransactionHistory(userId: string): Promise<TransactionHistoryDto[]> {
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
}
