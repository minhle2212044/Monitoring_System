import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import { HttpService } from '@nestjs/axios';
import * as bcrypt from 'bcrypt';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CoreIotService } from 'src/coreiot/coreiot.service';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private httpService: HttpService,
    private readonly coreIotService: CoreIotService
  ) {}

  async signup(dto: AuthDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
          tel: dto.tel,
          dob: dto.dob ? new Date(dto.dob) : new Date(),
          address: dto.address || '',
          sex: dto.sex || 'Male',
          role: dto.role || 'CUSTOMER',
        },
      });

      return { message: 'User registered successfully' };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { tel: dto.tel },
        ]
      }
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const pwMatches = await bcrypt.compare(dto.password, user.password);

    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }
    let coreIotToken = '';

    try {
        const coreRes = await lastValueFrom(
            this.httpService.post(
                'https://app.coreiot.io/api/auth/login',
                { username: dto.email, password: dto.password },
                { headers: { 'Content-Type': 'application/json' } },
            ),
        );
        coreIotToken = coreRes.data?.token || '';
    } catch (error) {
        console.warn('Không thể đăng nhập vào CoreIoT:', error.message);
    }

    await this.coreIotService.connectForUser(user.id);
    
    const token = await this.signToken(user.id, user.email);
    const refresh_token = await this.refreshToken(user.id, user.email);

    return {
      user: user.id,
      access_token: token.access_token,
      refresh_token: refresh_token,
      coreiot_token: coreIotToken,
      message: 'Login successful',
    };
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async reSignAccessToken(refresh_token: string): Promise<{ access_token: string }> {
        try {
            const payload = (await this.jwt.verifyAsync(refresh_token, {
                secret: process.env.REFRESH_TOKEN_SECRET,
            }))

            const user = await this.prisma.user.findUnique({
              where: { id: payload.sub },
            });

            if (!user || user.accessToken !== refresh_token) {
              throw new ForbiddenException('Invalid refresh token');
            }

            return await this.signToken(payload.sub, payload.email);
        } catch (err) {
            throw new ForbiddenException(err);
        }
    }


  async refreshToken(id: number, email: string): Promise<string> {
        let user = await this.prisma.user.findUnique({
            where: {
                id: id
            }
        })

        if (!user) {
            throw new ForbiddenException("Cannot find the user")
        }

        const secret = process.env.REFRESH_TOKEN_SECRET

        const payload = {
            sub: id,
            email
        }

        try {
            const token = await this.jwt.signAsync(payload, {
                expiresIn: '75m',
                secret: secret
            })

            user = await this.prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    accessToken: token
                }
            })

            return token
        } catch (err) {
            throw new ForbiddenException(err)
        }
    }

  async verifyToken(token: string, type: 'access' | 'refresh' = 'access'): Promise<any> {
  try {
    const secret =
      type === 'access'
        ? this.config.get('JWT_SECRET')
        : this.config.get('REFRESH_TOKEN_SECRET');

    const payload = await this.jwt.verifyAsync(token, {
      secret: secret,
    });

    return payload;
  } catch (err) {
    throw new ForbiddenException('Invalid or expired token');
  }
}
async changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ForbiddenException('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new ForbiddenException('Old password is incorrect');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await this.prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  return { message: 'Password changed successfully' };
}

}