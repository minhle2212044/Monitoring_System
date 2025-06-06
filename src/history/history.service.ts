import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(options: {
    userId: number;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const { userId, type, startDate, endDate, page = 1, pageSize = 10 } = options;

    const devices = await this.prisma.device.findMany({
      where: { userId },
      select: { id: true, deviceId: true }
    });

    if (!devices.length) return [];

    const deviceIds = devices.map(d => d.id);

    const where: any = {
      deviceId: { in: deviceIds },
    };

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.time = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      where.time = {
        gte: startDate,
      };
    } else if (endDate) {
      where.time = {
        lte: endDate,
      };
    }

    const total = await this.prisma.data.count({ where });

    const data = await this.prisma.data.findMany({
      where,
      orderBy: { time: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      total,
      page,
      pageSize,
      data,
    };
  }
}
