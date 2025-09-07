import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { LoginDto, AuthResponseDto } from '../dto/auth.dto';
export declare class AuthService {
    private userService;
    private jwtService;
    private sessionService;
    constructor(userService: UserService, jwtService: JwtService, sessionService: SessionService);
    login(loginDto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<AuthResponseDto>;
    logout(token: string): Promise<{
        message: string;
    }>;
    logoutAllSessions(userId: string): Promise<{
        message: string;
    }>;
    getActiveSessions(userId: string): Promise<any[]>;
    createAdmin(email: string, password: string, firstName: string, lastName: string): Promise<{
        message: string;
    }>;
}
