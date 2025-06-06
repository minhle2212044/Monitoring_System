import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
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
    @Query('page', ParseIntPipe) page = 1,
    @Query('pageSize', ParseIntPipe) pageSize = 20,
  ) {
    return this.activityService.getSuggestedActivities(userId, page, pageSize);
  }
}
