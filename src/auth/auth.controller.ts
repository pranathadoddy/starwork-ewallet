import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, Get, Req, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Headers('user-agent') userAgent?: string,
    @Req() req?: any,
  ): Promise<AuthResponseDto> {
    const deviceInfo = userAgent || 'Unknown Device';
    const ipAddress = req?.ip || req?.connection?.remoteAddress || 'Unknown IP';
    
    return this.authService.login(loginDto, deviceInfo, ipAddress);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllSessions(@Req() req: any) {
    const userId = req.user.id;
    return this.authService.logoutAllSessions(userId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(@Req() req: any) {
    const userId = req.user.id;
    const sessions = await this.authService.getActiveSessions(userId);
    return {
      message: 'Active sessions retrieved successfully',
      sessions,
    };
  }

  @Post('create-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() body: { email: string; password: string; firstName: string; lastName: string }) {
    return this.authService.createAdmin(body.email, body.password, body.firstName, body.lastName);
  }
}
