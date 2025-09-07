import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { UserRole } from '../entities/user.entity';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userService;
    private sessionService;
    constructor(configService: ConfigService, userService: UserService, sessionService: SessionService);
    validate(payload: any): Promise<{
        id: string;
        email: string;
        role: UserRole;
    }>;
}
export {};
