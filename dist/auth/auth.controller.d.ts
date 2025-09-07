import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto } from '../dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, userAgent?: string, req?: any): Promise<AuthResponseDto>;
    logout(req: any): Promise<{
        message: string;
    }>;
    logoutAllSessions(req: any): Promise<{
        message: string;
    }>;
    getActiveSessions(req: any): Promise<{
        message: string;
        sessions: any[];
    }>;
    createAdmin(body: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        message: string;
    }>;
}
