import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return login result', async () => {
      // Arrange
      const loginDto = { username: 'testuser', password: 'password123' };
      const mockResult = {
        access_token: 'jwt.token',
        user: { id: 1, username: 'testuser', isAdmin: false },
        isNewUser: false,
      };
      mockAuthService.login.mockResolvedValue(mockResult);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      // Arrange
      const mockRequest = {
        user: { id: 1, username: 'testuser', isAdmin: false },
      };

      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(mockRequest.user);
    });
  });
});
