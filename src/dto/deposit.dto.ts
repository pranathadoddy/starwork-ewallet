import { IsNumber, IsString, IsOptional, Min, IsPositive } from 'class-validator';

export class CreateDepositDto {
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ApproveDepositDto {
  @IsString()
  transactionId: string;
}

export class DepositResponseDto {
  id: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: Date;
}

export class PendingDepositDto {
  id: string;
  amount: number;
  description?: string;
  userId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: Date;
}
