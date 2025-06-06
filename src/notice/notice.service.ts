import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NoticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotices(userId: number) {
    return this.prisma.notice.findMany({
      where: { userId },
      orderBy: { time: 'desc' },
    });
  }

  async markAsRead(noticeId: number) {
    return this.prisma.notice.update({
      where: { id: noticeId },
      data: { message: '[Đã đọc] ' + new Date().toISOString() },
    });
  }

  async createNotice(userId: number, message: string, type: string = 'INFO') {
    return this.prisma.notice.create({
      data: {
        userId,
        message,
        time: new Date(),
        type,
      },
    });
  }

  async createWarningNoticeIfNeeded(userId: number, key: string, value: number) {
    const thresholds = {
      CO2: 1500,
      PM25: 100,
      temperature: 38,
    };

    const critical = {
      CO2: 3000,
      PM25: 150,
      temperature: 40,
    };

    const max = thresholds[key];
    const criticalMax = critical[key];

    if (max && value > max) {
      const type = value > criticalMax ? 'DANGER' : 'WARNING';
      const message = `Giá trị ${key} vượt ngưỡng an toàn: ${value}`;
      await this.createNotice(userId, message, type);
    }
  }
}
