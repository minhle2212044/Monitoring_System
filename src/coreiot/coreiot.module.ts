import { Module } from '@nestjs/common';
import { CoreIotService } from './coreiot.service';
import { NoticeModule } from 'src/notice/notice.module';
import { NoticeService } from 'src/notice/notice.service';
import { CoreIotController } from './coreiot.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, NoticeModule],
  providers: [CoreIotService, NoticeService],
  controllers: [CoreIotController]
})
export class CoreiotModule {}
