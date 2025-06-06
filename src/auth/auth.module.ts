import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CoreIotService } from 'src/coreiot/coreiot.service';
import { CoreiotModule } from 'src/coreiot/coreiot.module';
import { NoticeService } from 'src/notice/notice.service';
import { JwtStrategy } from './strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule.register({}), PrismaModule, HttpModule, ConfigModule, CoreiotModule],
  providers: [AuthService, JwtStrategy, CoreIotService, NoticeService],
  controllers: [AuthController]
})
export class AuthModule {}
