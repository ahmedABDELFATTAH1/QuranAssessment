import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully login an existing user with correct password', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        isAdmin: false,
      };
      const expectedToken = 'jwt.token.here';

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual({
        access_token: expectedToken,
        user: {
          id: 1,
          username: 'testuser',
          isAdmin: false,
        },
        isNewUser: false,
      });
    });

    it('should throw error for existing user with incorrect password', async () => {
      // Arrange
      const existingUser = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('differentpassword', 10),
        isAdmin: false,
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should create new user and login when user does not exist', async () => {
      // Arrange
      const newUser = {
        id: 2,
        username: 'testuser',
        password: expect.any(String),
        isAdmin: false,
      };
      const expectedToken = 'jwt.token.here';

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        password: expect.any(String),
        isAdmin: false,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result.isNewUser).toBe(true);
    });

    it('should create admin user when username contains "admin"', async () => {
      // Arrange
      const adminLoginDto: LoginDto = {
        username: 'admin1',
        password: 'password123',
      };
      const newAdminUser = {
        id: 3,
        username: 'admin1',
        password: expect.any(String),
        isAdmin: true,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(newAdminUser);
      mockUserRepository.save.mockResolvedValue(newAdminUser);
      mockJwtService.sign.mockReturnValue('admin.token');

      // Act
      const result = await service.login(adminLoginDto);

      // Assert
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'admin1',
        password: expect.any(String),
        isAdmin: true,
      });
      expect(result.user.isAdmin).toBe(true);
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid credentials', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'password123';
      const user = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('password123', 10),
        isAdmin: false,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.validateUser(username, password);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        isAdmin: false,
      });
    });

    it('should return null for invalid credentials', async () => {
      // Arrange
      const username = 'testuser';
      const password = 'wrongpassword';
      const user = {
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('correctpassword', 10),
        isAdmin: false,
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.validateUser(username, password);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('nonexistent', 'password');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user data for valid user ID', async () => {
      // Arrange
      const userId = 1;
      const user = {
        id: 1,
        username: 'testuser',
        isAdmin: false,
        createdAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'username', 'isAdmin', 'createdAt'],
      });
      expect(result).toEqual(user);
    });

    it('should return null for invalid user ID', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findById(999);

      // Assert
      expect(result).toBeNull();
    });
  });
});
