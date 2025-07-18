import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { User } from '../auth/entities/user.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';

describe('FeedbackService', () => {
  let service: FeedbackService;

  const mockFeedbackRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockWebsocketGateway = {
    notifyAdminsNewFeedback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockFeedbackRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: WebsocketGateway,
          useValue: mockWebsocketGateway,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createFeedbackDto: CreateFeedbackDto = {
      name: 'Test Feedback',
      message: 'This is test content',
      category: 'feature',
    };

    const mockUser = {
      id: 1,
      username: 'testuser',
      isAdmin: false,
    };

    it('should create and save feedback successfully', async () => {
      // Arrange
      const userId = 1;
      const mockFeedback = {
        id: 1,
        ...createFeedbackDto,
        userId,
        user: mockUser,
        isInappropriate: false,
        createdAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockFeedbackRepository.create.mockReturnValue(mockFeedback);
      mockFeedbackRepository.save.mockResolvedValue(mockFeedback);

      // Act
      const result = await service.create(createFeedbackDto, userId);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'username', 'isAdmin'],
      });
      expect(mockFeedbackRepository.create).toHaveBeenCalledWith({
        ...createFeedbackDto,
        userId,
        user: mockUser,
      });
      expect(mockFeedbackRepository.save).toHaveBeenCalledWith(mockFeedback);
      expect(mockWebsocketGateway.notifyAdminsNewFeedback).toHaveBeenCalled();
      expect(result).toEqual(mockFeedback);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createFeedbackDto, 999)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('findAll', () => {
    it('should return all feedback with user relations', async () => {
      // Arrange
      const mockFeedbacks = [
        {
          id: 1,
          name: 'Feedback 1',
          message: 'Content 1',
          category: 'bug',
          isInappropriate: false,
          user: { id: 1, username: 'user1' },
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'Feedback 2',
          message: 'Content 2',
          category: 'feature',
          isInappropriate: false,
          user: { id: 2, username: 'user2' },
          createdAt: new Date(),
        },
      ];

      mockFeedbackRepository.find.mockResolvedValue(mockFeedbacks);

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockFeedbackRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: { createdAt: 'DESC' },
        select: {
          user: {
            id: true,
            username: true,
            isAdmin: true,
          },
        },
      });
      expect(result).toEqual(mockFeedbacks);
    });
  });

  describe('findByUser', () => {
    it('should return feedback for specific user', async () => {
      // Arrange
      const userId = 1;
      const mockFeedbacks = [
        {
          id: 1,
          name: 'User Feedback',
          message: 'User content',
          category: 'bug',
          userId,
          user: { id: 1, username: 'user1' },
          createdAt: new Date(),
        },
      ];

      mockFeedbackRepository.find.mockResolvedValue(mockFeedbacks);

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(mockFeedbackRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
        select: {
          user: {
            id: true,
            username: true,
            isAdmin: true,
          },
        },
      });
      expect(result).toEqual(mockFeedbacks);
    });
  });

  describe('findOne', () => {
    it('should return feedback by ID with user relation', async () => {
      // Arrange
      const feedbackId = 1;
      const mockFeedback = {
        id: 1,
        name: 'Test Feedback',
        message: 'Test content',
        category: 'bug',
        isInappropriate: false,
        user: { id: 1, username: 'testuser' },
        createdAt: new Date(),
      };

      mockFeedbackRepository.findOne.mockResolvedValue(mockFeedback);

      // Act
      const result = await service.findOne(feedbackId);

      // Assert
      expect(mockFeedbackRepository.findOne).toHaveBeenCalledWith({
        where: { id: feedbackId },
        relations: ['user'],
        select: {
          user: {
            id: true,
            username: true,
            isAdmin: true,
          },
        },
      });
      expect(result).toEqual(mockFeedback);
    });

    it('should return null when feedback not found', async () => {
      // Arrange
      mockFeedbackRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findOne(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('markAsInappropriate', () => {
    it('should mark feedback as inappropriate and save', async () => {
      // Arrange
      const feedbackId = 1;
      const mockFeedback = {
        id: 1,
        name: 'Test Feedback',
        message: 'Test content',
        category: 'bug',
        isInappropriate: false,
        user: { id: 1, username: 'testuser' },
        createdAt: new Date(),
      };

      // Mock findOne to be called by markAsInappropriate
      service.findOne = jest.fn().mockResolvedValue(mockFeedback);
      mockFeedbackRepository.save.mockResolvedValue({
        ...mockFeedback,
        isInappropriate: true,
      });

      // Act
      const result = await service.markAsInappropriate(feedbackId);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(feedbackId);
      expect(mockFeedback.isInappropriate).toBe(true);
      expect(mockFeedbackRepository.save).toHaveBeenCalledWith(mockFeedback);
      expect(result.isInappropriate).toBe(true);
    });

    it('should throw error when feedback not found', async () => {
      // Arrange
      service.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(service.markAsInappropriate(999)).rejects.toThrow(
        'Feedback not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete feedback successfully', async () => {
      // Arrange
      const feedbackId = 1;
      mockFeedbackRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      await service.delete(feedbackId);

      // Assert
      expect(mockFeedbackRepository.delete).toHaveBeenCalledWith(feedbackId);
    });

    it('should throw error when feedback not found for deletion', async () => {
      // Arrange
      mockFeedbackRepository.delete.mockResolvedValue({ affected: 0 });

      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow('Feedback not found');
    });
  });
});
