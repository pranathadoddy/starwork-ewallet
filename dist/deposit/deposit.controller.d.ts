import { DepositService } from './deposit.service';
import { CreateDepositDto, DepositResponseDto, PendingDepositDto } from '../dto/deposit.dto';
export declare class DepositController {
    private readonly depositService;
    constructor(depositService: DepositService);
    createDepositRequest(createDepositDto: CreateDepositDto, req: any): Promise<{
        message: string;
        deposit: DepositResponseDto;
    }>;
    getPendingDeposits(): Promise<{
        message: string;
        deposits: PendingDepositDto[];
    }>;
    approveDeposit(body: {
        transactionId: string;
    }): Promise<{
        message: string;
        transaction: any;
    }>;
    getUserDeposits(req: any): Promise<{
        message: string;
        deposits: DepositResponseDto[];
    }>;
}
