import { WalletService } from './wallet.service';
import { TransferDto, PayWithBalanceDto, BalanceResponseDto, TransactionHistoryDto, TransferResponseDto } from '../dto/wallet.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        message: string;
        balance: BalanceResponseDto;
    }>;
    transferToUser(transferDto: TransferDto, req: any): Promise<{
        message: string;
        transfer: TransferResponseDto;
    }>;
    payWithBalance(payWithBalanceDto: PayWithBalanceDto, req: any): Promise<{
        message: string;
        transaction: any;
    }>;
    getTransactionHistory(req: any): Promise<{
        message: string;
        transactions: TransactionHistoryDto[];
    }>;
}
