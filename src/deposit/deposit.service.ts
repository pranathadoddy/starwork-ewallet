import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { CreateDepositDto, DepositResponseDto, PendingDepositDto } from '../dto/deposit.dto';

@Injectable()
export class DepositService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createDepositRequest(userId: string, createDepositDto: CreateDepositDto): Promise<DepositResponseDto> {
    const { amount, description } = createDepositDto;

    // Create transaction record with PENDING status
    const transaction = this.transactionRepository.create({
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
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

  async getPendingDeposits(): Promise<PendingDepositDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { 
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING 
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

  async approveDeposit(transactionId: string): Promise<{ message: string; transaction: any }> {
    // Use database transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the pending deposit transaction
      const transaction = await queryRunner.manager.findOne(Transaction, {
        where: { 
          id: transactionId,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.PENDING 
        },
        relations: ['user'],
      });

      if (!transaction) {
        throw new NotFoundException('Pending deposit transaction not found');
      }

      // Find or create user's wallet
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId: transaction.userId },
      });

      if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = queryRunner.manager.create(Wallet, {
          userId: transaction.userId,
          balance: 0,
        });
        await queryRunner.manager.save(wallet);
      }

      // Update transaction status to COMPLETED
      transaction.status = TransactionStatus.COMPLETED;
      await queryRunner.manager.save(transaction);

      // Update wallet balance (atomic operation)
      wallet.balance = Number(wallet.balance) + Number(transaction.amount);
      await queryRunner.manager.save(wallet);

      // Commit the transaction
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
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  async getUserDeposits(userId: string): Promise<DepositResponseDto[]> {
    const transactions = await this.transactionRepository.find({
      where: { 
        userId,
        type: TransactionType.DEPOSIT 
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
}
