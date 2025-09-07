import { Transaction } from './transaction.entity';
import { Wallet } from './wallet.entity';
import { Session } from './session.entity';
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    transactions: Transaction[];
    wallets: Wallet[];
    sessions: Session[];
}
