import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User, UserRole } from '../entities/user.entity';

describe('WalletService', () => {
  let service: WalletService;
  let transactionRepository: Repository<Transaction>;
  let walletRepository: Repository<Wallet>;
  let userRepository: Repository<User>;
  let dataSource: DataSource;

  const mockUser: User = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
    wallets: [],
    sessions: [],
  };

  const mockRecipient: User = {
    id: 'recipient-id',
    email: 'recipient@example.com',
    password: 'hashed-password',
    firstName: 'Recipient',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    transactions: [],
    wallets: [],
    sessions: [],
  };

  const mockWallet: Wallet = {
    id: 'wallet-id',
    balance: 100.50,
    userId: 'user-id',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction: Transaction = {
    id: 'transaction-id',
    type: TransactionType.TRANSFER,
    status: TransactionStatus.COMPLETED,
    amount: 50.00,
    description: 'Test transfer',
    userId: 'user-id',
    user: mockUser,
    recipientId: 'recipient-id',
    recipient: mockRecipient,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockTransactionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWalletRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(() => mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepository,
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: mockWalletRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return balance for existing wallet', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      const result = await service.getBalance('user-id');

      expect(result).toEqual({
        balance: 100.50,
        userId: 'user-id',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('should create wallet if it does not exist', async () => {
      const newWallet = { ...mockWallet, balance: 0 };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockWalletRepository.findOne.mockResolvedValue(null);
      mockWalletRepository.create.mockReturnValue(newWallet);
      mockWalletRepository.save.mockResolvedValue(newWallet);

      const result = await service.getBalance('user-id');

      expect(mockWalletRepository.create).toHaveBeenCalledWith({
        userId: 'user-id',
        balance: 0,
      });
      expect(mockWalletRepository.save).toHaveBeenCalledWith(newWallet);
      expect(result.balance).toBe(0);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getBalance('invalid-user-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transferToUser', () => {
    const transferDto = {
      recipientEmail: 'recipient@example.com',
      amount: 50.00,
      description: 'Test transfer',
    };

    beforeEach(() => {
      mockQueryRunner.connect.mockResolvedValue(undefined);
      mockQueryRunner.startTransaction.mockResolvedValue(undefined);
      mockQueryRunner.commitTransaction.mockResolvedValue(undefined);
      mockQueryRunner.rollbackTransaction.mockResolvedValue(undefined);
      mockQueryRunner.release.mockResolvedValue(undefined);
    });

    it('should transfer successfully', async () => {
      const recipientWallet = { ...mockWallet, userId: 'recipient-id', balance: 0 };
      const updatedSenderWallet = { ...mockWallet, balance: 50.50 };
      const updatedRecipientWallet = { ...recipientWallet, balance: 50.00 };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockRecipient) // Find recipient
        .mockResolvedValueOnce(mockWallet) // Find sender wallet
        .mockResolvedValueOnce(recipientWallet); // Find recipient wallet

      mockQueryRunner.manager.create.mockReturnValue(mockTransaction);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(mockTransaction) // Save transaction
        .mockResolvedValueOnce(updatedSenderWallet) // Save sender wallet
        .mockResolvedValueOnce(updatedRecipientWallet); // Save recipient wallet

      const result = await service.transferToUser('user-id', transferDto);

      expect(result).toEqual({
        id: mockTransaction.id,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
        status: mockTransaction.status,
        recipientId: mockTransaction.recipientId,
        recipient: {
          id: mockRecipient.id,
          email: mockRecipient.email,
          firstName: mockRecipient.firstName,
          lastName: mockRecipient.lastName,
        },
        createdAt: mockTransaction.createdAt,
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if recipient does not exist', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.transferToUser('user-id', transferDto)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for self-transfer', async () => {
      const selfUser = { ...mockUser, email: 'recipient@example.com' };
      mockQueryRunner.manager.findOne.mockResolvedValue(selfUser);

      await expect(service.transferToUser('user-id', transferDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      const lowBalanceWallet = { ...mockWallet, balance: 10.00 };
      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockRecipient) // Find recipient
        .mockResolvedValueOnce(lowBalanceWallet); // Find sender wallet

      await expect(service.transferToUser('user-id', transferDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('payWithBalance', () => {
    const payDto = {
      amount: 25.00,
      description: 'Test payment',
    };

    beforeEach(() => {
      mockQueryRunner.connect.mockResolvedValue(undefined);
      mockQueryRunner.startTransaction.mockResolvedValue(undefined);
      mockQueryRunner.commitTransaction.mockResolvedValue(undefined);
      mockQueryRunner.rollbackTransaction.mockResolvedValue(undefined);
      mockQueryRunner.release.mockResolvedValue(undefined);
    });

    it('should pay successfully', async () => {
      const paymentTransaction = {
        ...mockTransaction,
        type: TransactionType.PAYMENT,
        amount: 25.00,
        description: 'Test payment',
      };
      const updatedWallet = { ...mockWallet, balance: 75.50 };

      // Create a mutable wallet object with correct initial balance
      const mutableWallet = { ...mockWallet, balance: 100.50 };
      mockQueryRunner.manager.findOne.mockResolvedValue(mutableWallet);
      mockQueryRunner.manager.create.mockReturnValue(paymentTransaction);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(paymentTransaction)
        .mockResolvedValueOnce(updatedWallet);

      const result = await service.payWithBalance('user-id', payDto);

      expect(result.message).toBe('Payment completed successfully');
      expect(result.transaction.id).toBe(paymentTransaction.id);
      expect(result.transaction.amount).toBe(25.00);
      expect(result.transaction.description).toBe('Test payment');
      expect(result.transaction.status).toBe('COMPLETED');
      expect(result.transaction.newBalance).toBe(75.50);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for insufficient balance', async () => {
      const lowBalanceWallet = { ...mockWallet, balance: 10.00 };
      mockQueryRunner.manager.findOne.mockResolvedValue(lowBalanceWallet);

      await expect(service.payWithBalance('user-id', payDto)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history', async () => {
      const transactions = [mockTransaction];
      mockTransactionRepository.find.mockResolvedValue(transactions);

      const result = await service.getTransactionHistory('user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockTransaction.id,
        type: mockTransaction.type,
        status: mockTransaction.status,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
        recipientId: mockTransaction.recipientId,
        recipient: {
          id: mockRecipient.id,
          email: mockRecipient.email,
          firstName: mockRecipient.firstName,
          lastName: mockRecipient.lastName,
        },
        createdAt: mockTransaction.createdAt,
        updatedAt: mockTransaction.updatedAt,
      });
    });
  });
});
