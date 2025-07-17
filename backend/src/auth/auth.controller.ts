import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        message: result.isNewUser 
          ? 'Account created and logged in successfully' 
          : 'Login successful',
        token: result.access_token,
        user: result.user,
        isNewUser: result.isNewUser,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new HttpException(
        {
          message: 'Invalid credentials',
          error: 'Unauthorized',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validateToken(@Request() req) {
    const user = await this.authService.validateToken(req.user);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return { valid: true, user };
  }
}
