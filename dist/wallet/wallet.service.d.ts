import { Repository, DataSource } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { TransferDto, PayWithBalanceDto, BalanceResponseDto, TransactionHistoryDto, TransferResponseDto } from '../dto/wallet.dto';
export declare class WalletService {
    private transactionRepository;
    private walletRepository;
    private userRepository;
    private dataSource;
    constructor(transactionRepository: Repository<Transaction>, walletRepository: Repository<Wallet>, userRepository: Repository<User>, dataSource: DataSource);
    getBalance(userId: string): Promise<BalanceResponseDto>;
    transferToUser(userId: string, transferDto: TransferDto): Promise<TransferResponseDto>;
    payWithBalance(userId: string, payWithBalanceDto: PayWithBalanceDto): Promise<{
        message: string;
        transaction: any;
    }>;
    getTransactionHistory(userId: string): Promise<TransactionHistoryDto[]>;
}
