import { User } from './user.entity';
export declare class Wallet {
    id: string;
    balance: number;
    userId: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
