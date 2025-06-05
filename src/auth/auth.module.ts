import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({}), PrismaModule, HttpModule, ConfigModule],
  providers: [AuthService, JwtStrategy, ],
  controllers: [AuthController]
})
export class AuthModule {}
