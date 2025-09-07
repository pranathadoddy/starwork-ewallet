import { Controller, Post, Get, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto, DepositResponseDto, PendingDepositDto } from '../dto/deposit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('deposits')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.CREATED)
  async createDepositRequest(
    @Body() createDepositDto: CreateDepositDto,
    @Req() req: any,
  ): Promise<{ message: string; deposit: DepositResponseDto }> {
    const userId = req.user.id;
    const deposit = await this.depositService.createDepositRequest(userId, createDepositDto);
    
    return {
      message: 'Deposit request created successfully',
      deposit,
    };
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getPendingDeposits(): Promise<{ message: string; deposits: PendingDepositDto[] }> {
    const deposits = await this.depositService.getPendingDeposits();
    
    return {
      message: 'Pending deposits retrieved successfully',
      deposits,
    };
  }

  @Post('approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async approveDeposit(
    @Body() body: { transactionId: string },
  ): Promise<{ message: string; transaction: any }> {
    return this.depositService.approveDeposit(body.transactionId);
  }

  @Get('my-deposits')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async getUserDeposits(@Req() req: any): Promise<{ message: string; deposits: DepositResponseDto[] }> {
    const userId = req.user.id;
    const deposits = await this.depositService.getUserDeposits(userId);
    
    return {
      message: 'User deposits retrieved successfully',
      deposits,
    };
  }
}
