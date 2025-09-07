import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User, UserRole } from '../entities/user.entity';

describe('DepositService', () => {
  let service: DepositService;
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

  const mockWallet: Wallet = {
    id: 'wallet-id',
    balance: 0,
    userId: 'user-id',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction: Transaction = {
    id: 'transaction-id',
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.PENDING,
    amount: 100.00,
    description: 'Test deposit',
    userId: 'user-id',
    user: mockUser,
    recipientId: null,
    recipient: null,
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
        DepositService,
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

    service = module.get<DepositService>(DepositService);
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
    walletRepository = module.get<Repository<Wallet>>(getRepositoryToken(Wallet));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDepositRequest', () => {
    it('should create deposit request successfully', async () => {
      const createDepositDto = {
        amount: 100.00,
        description: 'Test deposit',
      };

      mockTransactionRepository.create.mockReturnValue(mockTransaction);
      mockTransactionRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.createDepositRequest('user-id', createDepositDto);

      expect(result).toEqual({
        id: mockTransaction.id,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
        status: mockTransaction.status,
        createdAt: mockTransaction.createdAt,
      });
      expect(mockTransactionRepository.create).toHaveBeenCalledWith({
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        amount: createDepositDto.amount,
        description: createDepositDto.description,
        userId: 'user-id',
      });
    });
  });

  describe('getPendingDeposits', () => {
    it('should return pending deposits', async () => {
      const pendingTransactions = [mockTransaction];
      mockTransactionRepository.find.mockResolvedValue(pendingTransactions);

      const result = await service.getPendingDeposits();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockTransaction.id,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
        userId: mockTransaction.userId,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
        createdAt: mockTransaction.createdAt,
      });
    });
  });

  describe('approveDeposit', () => {
    beforeEach(() => {
      mockQueryRunner.connect.mockResolvedValue(undefined);
      mockQueryRunner.startTransaction.mockResolvedValue(undefined);
      mockQueryRunner.commitTransaction.mockResolvedValue(undefined);
      mockQueryRunner.rollbackTransaction.mockResolvedValue(undefined);
      mockQueryRunner.release.mockResolvedValue(undefined);
    });

    it('should approve deposit successfully', async () => {
      const completedTransaction = { ...mockTransaction, status: TransactionStatus.COMPLETED };
      const updatedWallet = { ...mockWallet, balance: 100.00 };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockTransaction) // Find transaction
        .mockResolvedValueOnce(mockWallet); // Find wallet

      mockQueryRunner.manager.save
        .mockResolvedValueOnce(completedTransaction) // Save transaction
        .mockResolvedValueOnce(updatedWallet); // Save wallet

      const result = await service.approveDeposit('transaction-id');

      expect(result).toEqual({
        message: 'Deposit approved successfully',
        transaction: {
          id: mockTransaction.id,
          amount: mockTransaction.amount,
          status: TransactionStatus.COMPLETED,
          newBalance: updatedWallet.balance,
        },
      });
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should create wallet if it does not exist', async () => {
      const newWallet = { ...mockWallet, balance: 0 };
      const completedTransaction = { ...mockTransaction, status: TransactionStatus.COMPLETED };
      const updatedWallet = { ...newWallet, balance: 100.00 };

      mockQueryRunner.manager.findOne
        .mockResolvedValueOnce(mockTransaction) // Find transaction
        .mockResolvedValueOnce(null); // Wallet not found

      mockQueryRunner.manager.create.mockReturnValue(newWallet);
      mockQueryRunner.manager.save
        .mockResolvedValueOnce(newWallet) // Save new wallet
        .mockResolvedValueOnce(completedTransaction) // Save transaction
        .mockResolvedValueOnce(updatedWallet); // Save updated wallet

      const result = await service.approveDeposit('transaction-id');

      expect(mockQueryRunner.manager.create).toHaveBeenCalledWith(Wallet, {
        userId: mockTransaction.userId,
        balance: 0,
      });
      expect(result.transaction.newBalance).toBe(100.00);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockQueryRunner.manager.findOne.mockResolvedValue(null);

      await expect(service.approveDeposit('invalid-transaction-id')).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getUserDeposits', () => {
    it('should return user deposits', async () => {
      const userTransactions = [mockTransaction];
      mockTransactionRepository.find.mockResolvedValue(userTransactions);

      const result = await service.getUserDeposits('user-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockTransaction.id,
        amount: mockTransaction.amount,
        description: mockTransaction.description,
        status: mockTransaction.status,
        createdAt: mockTransaction.createdAt,
      });
    });
  });
});
