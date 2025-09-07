import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { LoginDto, AuthResponseDto } from '../dto/auth.dto';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async login(loginDto: LoginDto, deviceInfo?: string, ipAddress?: string): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    // Create session for SSO management
    await this.sessionService.createSession(user.id, token, deviceInfo, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    await this.sessionService.deactivateSession(token);
    return {
      message: 'Logged out successfully',
    };
  }

  async logoutAllSessions(userId: string): Promise<{ message: string }> {
    await this.sessionService.deactivateUserSessions(userId);
    return {
      message: 'All sessions logged out successfully',
    };
  }

  async getActiveSessions(userId: string): Promise<any[]> {
    const sessions = await this.sessionService.getUserActiveSessions(userId);
    return sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastUsedAt: session.lastUsedAt,
      createdAt: session.createdAt,
    }));
  }

  async createAdmin(email: string, password: string, firstName: string, lastName: string): Promise<{ message: string }> {
    // Check if admin already exists
    const existingAdmin = await this.userService.findByEmail(email);
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    await this.userService.createAdmin(email, password, firstName, lastName);

    return {
      message: 'Admin created successfully',
    };
  }
}
