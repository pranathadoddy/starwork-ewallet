import { UserService } from '../user/user.service';
export declare class SeederService {
    private readonly userService;
    private readonly logger;
    constructor(userService: UserService);
    seedAdmin(): Promise<void>;
}
