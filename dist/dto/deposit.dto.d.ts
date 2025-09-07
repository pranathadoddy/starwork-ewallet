export declare class CreateDepositDto {
    amount: number;
    description?: string;
}
export declare class ApproveDepositDto {
    transactionId: string;
}
export declare class DepositResponseDto {
    id: string;
    amount: number;
    description?: string;
    status: string;
    createdAt: Date;
}
export declare class PendingDepositDto {
    id: string;
    amount: number;
    description?: string;
    userId: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    createdAt: Date;
}
