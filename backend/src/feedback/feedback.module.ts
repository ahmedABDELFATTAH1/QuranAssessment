import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from './entities/feedback.entity';
import { User } from '../auth/entities/user.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feedback, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [FeedbackService, WebsocketGateway],
  controllers: [FeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}
