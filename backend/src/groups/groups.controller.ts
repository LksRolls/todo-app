import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    const data = await this.groupsService.findAll(user.id);
    return { statusCode: 200, message: 'Success', data };
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateGroupDto) {
    const user = req.user as any;
    const data = await this.groupsService.create(user.id, dto);
    return { statusCode: 201, message: 'Group created', data };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    const user = req.user as any;
    const data = await this.groupsService.update(id, user.id, dto);
    return { statusCode: 200, message: 'Group updated', data };
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    await this.groupsService.remove(id, user.id);
    return { statusCode: 200, message: 'Group deleted', data: null };
  }
}
