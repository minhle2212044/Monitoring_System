import { Module } from '@nestjs/common';
import { CoreIotService } from './coreiot.service';
import { CoreIotController } from './coreiot.controller';

@Module({
  providers: [CoreIotService],
  controllers: [CoreIotController]
})
export class CoreiotModule {}
