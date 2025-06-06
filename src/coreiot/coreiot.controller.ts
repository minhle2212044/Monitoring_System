import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Query,
  UseGuards
} from '@nestjs/common';
import { CoreIotService, DeviceData } from './coreiot.service';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('api/v1/coreiot')
export class CoreIotController {
  constructor(private readonly coreIotService: CoreIotService) {}

  // Gọi để fetch dữ liệu telemetry mới nhất từ CoreIoT và lưu vào DB
  @Get(':id/fetch')
  async fetchTelemetryFromCoreIot(
    @Param('id', ParseIntPipe) userId: number,
    @Query('token') coreiotToken: string,
  ) {
    return await this.coreIotService.fetchLatestTelemetryForUser(userId, coreiotToken);
  }

  // Gửi dữ liệu telemetry lên CoreIoT (MQTT)
  @Post(':id/send')
  async sendTelemetry(
    @Param('id', ParseIntPipe) deviceId: number,
    @Body() body: any,
  ) {
    return await this.coreIotService.sendTelemetry(deviceId, body);
  }

  // Lấy dữ liệu telemetry mới nhất từ DB (đã lưu sẵn)
  @Get(':id/data')
  async getTelemetryFromDb(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<DeviceData[]> {
    return await this.coreIotService.getSensorDataFromDb(userId);
  }
}
