import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { User } from '../entities/user.entity';
export declare class SessionService {
    private sessionRepository;
    private userRepository;
    constructor(sessionRepository: Repository<Session>, userRepository: Repository<User>);
    createSession(userId: string, token: string, deviceInfo?: string, ipAddress?: string): Promise<Session>;
    deactivateUserSessions(userId: string): Promise<void>;
    validateSession(token: string): Promise<Session | null>;
    deactivateSession(token: string): Promise<void>;
    getUserActiveSessions(userId: string): Promise<Session[]>;
    cleanupExpiredSessions(): Promise<void>;
}
