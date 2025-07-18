import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WebsocketGateway } from './websocket.gateway';
import { Server, Socket } from 'socket.io';

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockServer: jest.Mocked<Server>;
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(async () => {
    mockJwtService = {
      verify: jest.fn(),
    } as any;

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    mockSocket = {
      emit: jest.fn(),
      join: jest.fn(),
      disconnect: jest.fn(),
      handshake: {
        auth: {},
        headers: {},
      },
      data: {},
      id: 'socket-123',
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
    gateway.server = mockServer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate admin user with valid token', async () => {
      // Arrange
      const mockPayload = { sub: 1, username: 'admin1', isAdmin: true };
      mockSocket.handshake.auth.token = 'valid.jwt.token';
      mockJwtService.verify.mockReturnValue(mockPayload);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
      expect(mockSocket.data.user).toEqual(mockPayload);
      expect(consoleSpy).toHaveBeenCalledWith('Admin connected: admin1');
      expect(consoleSpy).toHaveBeenCalledWith(
        'User connected: admin1 (socket-123)',
      );

      consoleSpy.mockRestore();
    });

    it('should authenticate regular user with valid token', async () => {
      // Arrange
      const mockPayload = { sub: 2, username: 'user1', isAdmin: false };
      mockSocket.handshake.auth.token = 'valid.jwt.token';
      mockJwtService.verify.mockReturnValue(mockPayload);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
      expect(mockSocket.data.user).toEqual(mockPayload);
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Admin connected:'),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'User connected: user1 (socket-123)',
      );

      consoleSpy.mockRestore();
    });

    it('should handle connection with token in authorization header', async () => {
      // Arrange
      const mockPayload = { sub: 3, username: 'user2', isAdmin: false };
      mockSocket.handshake.headers.authorization = 'Bearer valid.jwt.token';
      mockJwtService.verify.mockReturnValue(mockPayload);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid.jwt.token');
      expect(consoleSpy).toHaveBeenCalledWith(
        'User connected: user2 (socket-123)',
      );

      consoleSpy.mockRestore();
    });

    it('should handle connection without token', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(mockJwtService.verify).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Anonymous user connected: socket-123',
      );

      consoleSpy.mockRestore();
    });

    it('should handle invalid token gracefully', async () => {
      // Arrange
      mockSocket.handshake.auth.token = 'invalid.jwt.token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith('invalid.jwt.token');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid token on connection: socket-123',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnection with username', () => {
      // Arrange
      mockSocket.data.user = { username: 'testuser' };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      gateway.handleDisconnect(mockSocket);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User disconnected: testuser (socket-123)',
      );

      consoleSpy.mockRestore();
    });

    it('should log disconnection for anonymous user', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      gateway.handleDisconnect(mockSocket);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User disconnected: Anonymous (socket-123)',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('handleJoinAdminRoom', () => {
    it('should allow admin to join admin room', () => {
      // Arrange
      mockSocket.data.user = { isAdmin: true };

      // Act
      const result = gateway.handleJoinAdminRoom(mockSocket);

      // Assert
      expect(mockSocket.join).toHaveBeenCalledWith('admin-room');
      expect(result).toEqual({
        success: true,
        message: 'Joined admin room',
      });
    });

    it('should deny non-admin access to admin room', () => {
      // Arrange
      mockSocket.data.user = { isAdmin: false };

      // Act
      const result = gateway.handleJoinAdminRoom(mockSocket);

      // Assert
      expect(mockSocket.join).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        message: 'Access denied',
      });
    });
  });

  describe('notifyAdminsNewFeedback', () => {
    it('should emit new feedback notification to admin room', () => {
      // Arrange
      const feedbackData = {
        id: 1,
        name: 'Test Feedback',
        message: 'Test message',
        category: 'bug',
        createdAt: new Date(),
        user: {
          id: 1,
          username: 'testuser',
          isAdmin: false,
        },
      };

      // Act
      gateway.notifyAdminsNewFeedback(feedbackData);

      // Assert
      expect(mockServer.to).toHaveBeenCalledWith('admin-room');
      expect(mockServer.emit).toHaveBeenCalledWith('new-feedback', {
        type: 'NEW_FEEDBACK',
        data: feedbackData,
        timestamp: expect.any(String),
      });
    });

    it('should handle notification with any feedback data', () => {
      // Arrange
      const simpleFeedback = { message: 'Simple feedback' };

      // Act
      gateway.notifyAdminsNewFeedback(simpleFeedback);

      // Assert
      expect(mockServer.to).toHaveBeenCalledWith('admin-room');
      expect(mockServer.emit).toHaveBeenCalledWith('new-feedback', {
        type: 'NEW_FEEDBACK',
        data: simpleFeedback,
        timestamp: expect.any(String),
      });
    });
  });

  describe('handleMessage', () => {
    it('should return hello world message', () => {
      // Arrange
      const testPayload = { message: 'test' };

      // Act
      const result = gateway.handleMessage(mockSocket, testPayload);

      // Assert
      expect(result).toBe('Hello world!');
    });
  });
});
