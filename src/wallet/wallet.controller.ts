import { Controller, Post, Get, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TransferDto, PayWithBalanceDto, BalanceResponseDto, TransactionHistoryDto, TransferResponseDto } from '../dto/wallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../entities/user.entity';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async getBalance(@Req() req: any): Promise<{ message: string; balance: BalanceResponseDto }> {
    const userId = req.user.id;
    const balance = await this.walletService.getBalance(userId);
    
    return {
      message: 'Balance retrieved successfully',
      balance,
    };
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async transferToUser(
    @Body() transferDto: TransferDto,
    @Req() req: any,
  ): Promise<{ message: string; transfer: TransferResponseDto }> {
    const userId = req.user.id;
    const transfer = await this.walletService.transferToUser(userId, transferDto);
    
    return {
      message: 'Transfer completed successfully',
      transfer,
    };
  }

  @Post('pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async payWithBalance(
    @Body() payWithBalanceDto: PayWithBalanceDto,
    @Req() req: any,
  ): Promise<{ message: string; transaction: any }> {
    const userId = req.user.id;
    return this.walletService.payWithBalance(userId, payWithBalanceDto);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @HttpCode(HttpStatus.OK)
  async getTransactionHistory(@Req() req: any): Promise<{ message: string; transactions: TransactionHistoryDto[] }> {
    const userId = req.user.id;
    const transactions = await this.walletService.getTransactionHistory(userId);
    
    return {
      message: 'Transaction history retrieved successfully',
      transactions,
    };
  }
}
