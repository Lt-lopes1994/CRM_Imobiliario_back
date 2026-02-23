import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';
import type { StringValue } from 'ms';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
  updatedAt: Date;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('E-mail já está em uso');
    }

    const hashedPassword = await hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return {
      accessToken: this.createAccessToken(user),
      user: this.mapUser(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isValidPassword = await compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      accessToken: this.createAccessToken(user),
      user: this.mapUser(user),
    };
  }

  async profile(userId: string): Promise<AuthUser> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.mapUser(user);
  }

  private createAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtExpiresIn = (this.configService.get<string>('JWT_EXPIRES_IN') ??
      '15m') as StringValue;

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') ?? 'change-me',
      expiresIn: jwtExpiresIn,
    });
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
