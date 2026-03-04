import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HistoryService } from './history.service';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('groupId') groupId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as any;
    const result = await this.historyService.findAll(
      user.id,
      groupId,
      from,
      to,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
    return { statusCode: 200, message: 'Success', data: result };
  }

  @Post(':taskId/reactivate')
  async reactivate(@Req() req: Request, @Param('taskId') taskId: string) {
    const user = req.user as any;
    const data = await this.historyService.reactivate(taskId, user.id);
    return { statusCode: 200, message: 'Task reactivated', data };
  }
}
