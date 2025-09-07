export declare class TransferDto {
    recipientEmail: string;
    amount: number;
    description?: string;
}
export declare class PayWithBalanceDto {
    amount: number;
    description?: string;
}
export declare class BalanceResponseDto {
    balance: number;
    userId: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
export declare class TransactionHistoryDto {
    id: string;
    type: string;
    status: string;
    amount: number;
    description?: string;
    recipientId?: string;
    recipient?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class TransferResponseDto {
    id: string;
    amount: number;
    description?: string;
    status: string;
    recipientId: string;
    recipient: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
}
