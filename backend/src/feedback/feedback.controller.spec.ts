import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';

describe('FeedbackController', () => {
  let controller: FeedbackController;

  const mockFeedbackService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    markAsInappropriate: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create feedback successfully', async () => {
      // Arrange
      const createFeedbackDto = {
        name: 'Test Feedback',
        message: 'Test message',
        category: 'bug',
      };
      const mockRequest = { user: { id: 1 } };
      const mockResult = {
        id: 1,
        ...createFeedbackDto,
        userId: 1,
        createdAt: new Date(),
      };
      mockFeedbackService.create.mockResolvedValue(mockResult);

      // Act
      const result = await controller.create(createFeedbackDto, mockRequest);

      // Assert
      expect(mockFeedbackService.create).toHaveBeenCalledWith(
        createFeedbackDto,
        1,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should return user feedback for non-admin', async () => {
      // Arrange
      const mockRequest = { user: { id: 1, isAdmin: false } };
      const mockFeedbacks = [
        { id: 1, name: 'Feedback 1', message: 'Message 1', userId: 1 },
      ];
      mockFeedbackService.findByUser.mockResolvedValue(mockFeedbacks);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(mockFeedbackService.findByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFeedbacks);
    });

    it('should return all feedback for admin', async () => {
      // Arrange
      const mockRequest = { user: { id: 1, isAdmin: true } };
      const mockFeedbacks = [
        { id: 1, name: 'Feedback 1', message: 'Message 1' },
        { id: 2, name: 'Feedback 2', message: 'Message 2' },
      ];
      mockFeedbackService.findAll.mockResolvedValue(mockFeedbacks);

      // Act
      const result = await controller.findAll(mockRequest);

      // Assert
      expect(mockFeedbackService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Feedback retrieved successfully',
        feedback: mockFeedbacks,
      });
    });
  });

  describe('findOne', () => {
    it('should return feedback by id for admin', async () => {
      // Arrange
      const feedbackId = '1';
      const mockRequest = { user: { id: 1, isAdmin: true } };
      const mockFeedback = {
        id: 1,
        name: 'Test Feedback',
        message: 'Test message',
        userId: 2,
      };
      mockFeedbackService.findOne.mockResolvedValue(mockFeedback);

      // Act
      const result = await controller.findOne(feedbackId, mockRequest);

      // Assert
      expect(mockFeedbackService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Feedback retrieved successfully',
        feedback: mockFeedback,
      });
    });

    it('should return own feedback for regular user', async () => {
      // Arrange
      const feedbackId = '1';
      const mockRequest = { user: { id: 1, isAdmin: false } };
      const mockFeedback = {
        id: 1,
        name: 'Test Feedback',
        message: 'Test message',
        userId: 1,
      };
      mockFeedbackService.findOne.mockResolvedValue(mockFeedback);

      // Act
      const result = await controller.findOne(feedbackId, mockRequest);

      // Assert
      expect(mockFeedbackService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Feedback retrieved successfully',
        feedback: mockFeedback,
      });
    });
  });

  describe('markAsInappropriate', () => {
    it('should mark feedback as inappropriate for admin', async () => {
      // Arrange
      const feedbackId = '1';
      const mockRequest = { user: { id: 1, isAdmin: true } };
      const mockFeedback = {
        id: 1,
        name: 'Test Feedback',
        isInappropriate: true,
      };
      mockFeedbackService.markAsInappropriate.mockResolvedValue(mockFeedback);

      // Act
      const result = await controller.markAsInappropriate(
        feedbackId,
        mockRequest,
      );

      // Assert
      expect(mockFeedbackService.markAsInappropriate).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: 'Feedback marked as inappropriate',
        feedback: mockFeedback,
      });
    });
  });
});
