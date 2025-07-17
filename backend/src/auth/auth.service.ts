import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    // First, try to find existing user
    let existingUser = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    if (existingUser) {
      // User exists, validate password
      const isPasswordValid = await bcrypt.compare(loginDto.password, existingUser.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Return existing user data
      const payload = {
        username: existingUser.username,
        sub: existingUser.id,
        isAdmin: existingUser.isAdmin,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: existingUser.id,
          username: existingUser.username,
          isAdmin: existingUser.isAdmin,
        },
        isNewUser: false,
      };
    } else {
      // User doesn't exist, create new user
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      
      // Check if username contains "admin" (case-insensitive) to determine admin status
      const isAdmin = loginDto.username.toLowerCase().includes('admin');
      
      const newUser = this.userRepository.create({
        username: loginDto.username,
        password: hashedPassword,
        isAdmin: isAdmin,
      });

      const savedUser = await this.userRepository.save(newUser);

      const payload = {
        username: savedUser.username,
        sub: savedUser.id,
        isAdmin: savedUser.isAdmin,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: savedUser.id,
          username: savedUser.username,
          isAdmin: savedUser.isAdmin,
        },
        isNewUser: true,
      };
    }
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'isAdmin', 'createdAt'],
    });
  }

  async validateToken(user: any): Promise<User | null> {
    return this.findById(user.id);
  }
}
