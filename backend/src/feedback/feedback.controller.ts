import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    try {
      const feedback = await this.feedbackService.create(createFeedbackDto, req.user.id);
      return {
        message: 'Feedback submitted successfully',
        feedback,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to submit feedback',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req) {
    try {
      // Only admins can see all feedback
      if (!req.user.isAdmin) {
        return this.feedbackService.findByUser(req.user.id);
      }
      
      const feedback = await this.feedbackService.findAll();
      return {
        message: 'Feedback retrieved successfully',
        feedback,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to retrieve feedback',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-feedback')
  async getMyFeedback(@Request() req) {
    try {
      const feedback = await this.feedbackService.findByUser(req.user.id);
      return {
        message: 'Your feedback retrieved successfully',
        feedback,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to retrieve your feedback',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    try {
      const feedback = await this.feedbackService.findOne(+id);
      
      if (!feedback) {
        throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
      }

      // Users can only see their own feedback, admins can see all
      if (!req.user.isAdmin && feedback.userId !== req.user.id) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      return {
        message: 'Feedback retrieved successfully',
        feedback,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to retrieve feedback',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/mark-inappropriate')
  async markAsInappropriate(@Param('id') id: string, @Request() req) {
    try {
      // Only admins can mark feedback as inappropriate
      if (!req.user.isAdmin) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const feedback = await this.feedbackService.markAsInappropriate(+id);
      return {
        message: 'Feedback marked as inappropriate',
        feedback,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to mark feedback as inappropriate',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    try {
      const feedback = await this.feedbackService.findOne(+id);
      
      if (!feedback) {
        throw new HttpException('Feedback not found', HttpStatus.NOT_FOUND);
      }

      // Users can delete their own feedback, admins can delete any
      if (!req.user.isAdmin && feedback.userId !== req.user.id) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      await this.feedbackService.delete(+id);
      return {
        message: 'Feedback deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          message: 'Failed to delete feedback',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
