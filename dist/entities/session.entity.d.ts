import { User } from './user.entity';
export declare class Session {
    id: string;
    userId: string;
    user: User;
    token: string;
    isActive: boolean;
    deviceInfo: string;
    ipAddress: string;
    createdAt: Date;
    lastUsedAt: Date;
}
