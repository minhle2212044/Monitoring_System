import { Module } from '@nestjs/common';
import { CoreIotService } from './coreiot.service';
import { CoreIotController } from './coreiot.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CoreIotService],
  controllers: [CoreIotController]
})
export class CoreiotModule {}
