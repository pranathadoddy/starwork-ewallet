import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly userService: UserService) {}

  async seedAdmin(): Promise<void> {
    try {
      // Check if admin already exists
      const existingAdmin = await this.userService.findByEmail('admin@ewallet.com');
      if (existingAdmin) {
        this.logger.log('Admin user already exists');
        return;
      }

      // Create admin user
      await this.userService.createAdmin(
        'admin@ewallet.com',
        'admin123',
        'Admin',
        'User'
      );

      this.logger.log('Admin user created successfully');
    } catch (error) {
      this.logger.error('Error seeding admin user:', error);
    }
  }
}
