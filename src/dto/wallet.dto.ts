import { IsNumber, IsString, IsOptional, Min, IsPositive, IsEmail, IsUUID } from 'class-validator';

export class TransferDto {
  @IsEmail()
  recipientEmail: string;

  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class PayWithBalanceDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class BalanceResponseDto {
  balance: number;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class TransactionHistoryDto {
  id: string;
  type: string;
  status: string;
  amount: number;
  description?: string;
  recipientId?: string;
  recipient?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class TransferResponseDto {
  id: string;
  amount: number;
  description?: string;
  status: string;
  recipientId: string;
  recipient: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}
