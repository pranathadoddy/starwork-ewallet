import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { CreateDepositDto, DepositResponseDto, PendingDepositDto } from '../dto/deposit.dto';
export declare class DepositService {
    private transactionRepository;
    private walletRepository;
    private userRepository;
    private dataSource;
    constructor(transactionRepository: Repository<Transaction>, walletRepository: Repository<Wallet>, userRepository: Repository<User>, dataSource: DataSource);
    createDepositRequest(userId: string, createDepositDto: CreateDepositDto): Promise<DepositResponseDto>;
    getPendingDeposits(): Promise<PendingDepositDto[]>;
    approveDeposit(transactionId: string): Promise<{
        message: string;
        transaction: any;
    }>;
    getUserDeposits(userId: string): Promise<DepositResponseDto[]>;
}
