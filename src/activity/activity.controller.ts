import { Controller, Get, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('/api/v1/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getAllActivities(
    @Query('page') pageRaw: string,
    @Query('pageSize') pageSizeRaw: string,
  ) {
    const page = parseInt(pageRaw) || 1;
    const pageSize = parseInt(pageSizeRaw) || 20;
    
    return this.activityService.getAllActivities(page, pageSize);
  }

  @Get('suggested')
  async getSuggestedActivities(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('page') pageRaw: string,
    @Query('pageSize') pageSizeRaw: string,
  ) {
    const page = parseInt(pageRaw) || 1;
    const pageSize = parseInt(pageSizeRaw) || 20;
    return this.activityService.getSuggestedActivities(userId, page, pageSize);
  }
}
