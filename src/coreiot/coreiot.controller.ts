import { Controller, Post, Body } from '@nestjs/common';
import { CoreIotService } from './coreiot.service';

@Controller('coreiot')
export class CoreIotController {
  constructor(private readonly coreIotService: CoreIotService) {}

  @Post('send')
  async sendData(@Body() body: any) {
    return await this.coreIotService.sendTelemetry(body);
  }
}
