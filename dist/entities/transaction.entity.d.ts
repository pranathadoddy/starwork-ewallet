import { User } from './user.entity';
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    TRANSFER = "TRANSFER",
    PAYMENT = "PAYMENT"
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class Transaction {
    id: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    description: string;
    userId: string;
    user: User;
    recipientId: string;
    recipient: User;
    createdAt: Date;
    updatedAt: Date;
}
