import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  UseGuards
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { NoticeService } from './notice.service';

@UseGuards(JwtGuard)
@Controller('api/v1/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get(':userId')
  getNotices(@Param('userId') userId: string) {
    return this.noticeService.getNotices(Number(userId));
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.noticeService.markAsRead(Number(id));
  }

  @Post()
  createNotice(
    @Body() body: { userId: number; message: string; type?: string },
  ) {
    const { userId, message, type } = body;
    return this.noticeService.createNotice(userId, message, type);
  }

  @Post('warning')
  createWarningIfNeeded(
    @Body() body: { userId: number; key: string; value: number },
  ) {
    const { userId, key, value } = body;
    return this.noticeService.createWarningNoticeIfNeeded(userId, key, value);
  }
}
