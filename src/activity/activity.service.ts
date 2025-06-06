import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllActivities(page = 1, pageSize = 20) {
    const total = await this.prisma.activity.count();

    const activities = await this.prisma.activity.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: 'desc' },
    });
    console.log('Activities:', activities);
    return {
      total,
      page,
      pageSize,
      data: activities,
    };
  }

  async getSuggestedActivities(userId: number, page = 1, pageSize = 20) {
    // Lấy tất cả thiết bị của user
    const devices = await this.prisma.device.findMany({
      where: { userId },
      select: { id: true },
    });

    const deviceIds = devices.map(d => d.id);
    if (!deviceIds.length) return { total: 0, page, pageSize, data: [] };

    // Lấy dữ liệu sensor mới nhất cho các loại cảm biến
    const types = ['temperature', 'humidity', 'CO2', 'PM25'];
    const latestData: Record<string, number> = {};

    for (const type of types) {
      const entry = await this.prisma.data.findFirst({
        where: {
          type,
          deviceId: { in: deviceIds },
        },
        orderBy: { time: 'desc' },
      });
      if (entry) latestData[type] = entry.data;
    }

    // So sánh dữ liệu với điều kiện của activity để lấy các hoạt động phù hợp
    const activities = await this.prisma.activity.findMany();

    const filtered = activities.filter((a) => {
      const t = latestData['temperature'];
      const h = latestData['humidity'];
      const co2 = latestData['CO2'];
      const pm25 = latestData['PM25'];

      return (
        (t === undefined || (t >= a.temp_min && t <= a.temp_max)) &&
        (h === undefined || (h >= a.humid_min && h <= a.humid_max)) &&
        (co2 === undefined || co2 <= a.co2) &&
        (pm25 === undefined || pm25 <= a.pm25)
      );
    });

    // Phân trang kết quả đã lọc
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = filtered.slice(start, end);

    return {
      total,
      page,
      pageSize,
      data: paged,
    };
  }
}
