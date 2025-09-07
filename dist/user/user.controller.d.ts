import { UserService } from './user.service';
import { RegisterDto } from '../dto/auth.dto';
import { UserRole } from '../entities/user.entity';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: any;
    }>;
    getAllUsers(): Promise<{
        message: string;
        users: import("../entities/user.entity").User[];
    }>;
    getProfile(req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
            isActive: boolean;
            createdAt: Date;
        };
    }>;
    updateProfile(req: any, updateData: {
        firstName?: string;
        lastName?: string;
    }): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
        };
    }>;
}
