import { IsString, IsEnum, IsOptional, MinLength, MaxLength } from 'class-validator';
import { Priority } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  groupId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
