import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { User } from '../auth/entities/user.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: number): Promise<Feedback> {
    // Get user information
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'isAdmin'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create feedback
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      userId: userId,
      username: user.username, // Store username directly
      user: user,
    });

    const savedFeedback = await this.feedbackRepository.save(feedback);

    // Prepare feedback data for real-time notification
    const feedbackForNotification = {
      id: savedFeedback.id,
      name: savedFeedback.name,
      message: savedFeedback.message,
      category: savedFeedback.category,
      username: savedFeedback.username,
      createdAt: savedFeedback.createdAt,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    };

    // Notify admins in real-time via WebSocket
    this.websocketGateway.notifyAdminsNewFeedback(feedbackForNotification);

    return savedFeedback;
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackRepository.find({
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
  }

  async findByUser(userId: number): Promise<Feedback[]> {
    return this.feedbackRepository.find({
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
  }

  async findOne(id: number): Promise<Feedback | null> {
    return this.feedbackRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          isAdmin: true,
        },
      },
    });
  }

  async markAsInappropriate(id: number): Promise<Feedback> {
    const feedback = await this.findOne(id);
    if (!feedback) {
      throw new Error('Feedback not found');
    }

    feedback.isInappropriate = true;
    return this.feedbackRepository.save(feedback);
  }

  async delete(id: number): Promise<void> {
    const result = await this.feedbackRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Feedback not found');
    }
  }
}
