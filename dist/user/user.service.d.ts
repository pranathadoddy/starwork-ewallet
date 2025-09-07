import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
export declare class UserService {
    private userRepository;
    private walletRepository;
    constructor(userRepository: Repository<User>, walletRepository: Repository<Wallet>);
    create(registerDto: any): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    createAdmin(email: string, password: string, firstName: string, lastName: string): Promise<User>;
    getAllUsers(): Promise<User[]>;
    updateProfile(userId: string, updateData: {
        firstName?: string;
        lastName?: string;
    }): Promise<User>;
}
