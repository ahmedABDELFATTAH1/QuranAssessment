import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { User } from './auth/entities/user.entity';
import { Feedback } from './feedback/entities/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host:  '127.0.0.1',
      port:  3307,
      username: 'feedback_user',
      password: 'feedback_password',
      database: 'feedback_board',
      entities: [User, Feedback],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule, 
    FeedbackModule
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway],
})
export class AppModule {}
