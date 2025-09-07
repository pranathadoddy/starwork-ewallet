import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { User, UserRole } from '../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let sessionService: SessionService;
  let jwtService: JwtService;

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

  const mockUserService = {
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
    createAdmin: jest.fn(),
  };

  const mockSessionService = {
    createSession: jest.fn(),
    deactivateSession: jest.fn(),
    deactivateUserSessions: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    sessionService = module.get<SessionService>(SessionService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user data and token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockToken = 'jwt-token';

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);
      mockSessionService.createSession.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          role: mockUser.role,
        },
        token: mockToken,
      });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockSessionService.createSession).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = { email: 'invalid@example.com', password: 'password123' };

      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong-password' };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const inactiveUser = { ...mockUser, isActive: false };

      mockUserService.findByEmail.mockResolvedValue(inactiveUser);
      mockUserService.validatePassword.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createAdmin', () => {
    it('should create admin successfully', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
      };

      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createAdmin.mockResolvedValue({});

      const result = await service.createAdmin(
        adminData.email,
        adminData.password,
        adminData.firstName,
        adminData.lastName,
      );

      expect(result).toEqual({ message: 'Admin created successfully' });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(adminData.email);
      expect(mockUserService.createAdmin).toHaveBeenCalledWith(
        adminData.email,
        adminData.password,
        adminData.firstName,
        adminData.lastName,
      );
    });

    it('should throw ConflictException if admin already exists', async () => {
      const adminData = {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
      };

      mockUserService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.createAdmin(adminData.email, adminData.password, adminData.firstName, adminData.lastName),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const token = 'jwt-token';
      mockSessionService.deactivateSession.mockResolvedValue({});

      const result = await service.logout(token);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockSessionService.deactivateSession).toHaveBeenCalledWith(token);
    });
  });

  describe('logoutAllSessions', () => {
    it('should logout all sessions successfully', async () => {
      const userId = 'user-id';
      mockSessionService.deactivateUserSessions.mockResolvedValue({});

      const result = await service.logoutAllSessions(userId);

      expect(result).toEqual({ message: 'All sessions logged out successfully' });
      expect(mockSessionService.deactivateUserSessions).toHaveBeenCalledWith(userId);
    });
  });
});
