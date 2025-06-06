import { Controller, Post, Body, Param, ParseIntPipe, Get, Query} from '@nestjs/common';
import { CoreIotService, DeviceData } from './coreiot.service';

@Controller('coreiot')
export class CoreIotController {
  constructor(private readonly coreIotService: CoreIotService) {}

  @Get(':id')
  async getData(@Param('id', ParseIntPipe) id: number, @Query('token') coreiotToken: string,) {
    return await this.coreIotService.fetchLatestTelemetryForUser(id, coreiotToken);
  }

  @Post('send/:id')
  async sendData(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return await this.coreIotService.sendTelemetry(id, body);
  }
  
  @Get('data/:id')
  async getTelementry(@Param('id', ParseIntPipe) id: number): Promise<DeviceData[]>  {
    return await this.coreIotService.getSensorDataFromDb(id);
  }
}
