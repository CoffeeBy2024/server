import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateWorkingHoursDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHoursDto } from './dto/update-working_hour.dto';
import { ShopService } from '../shop/shop.service';
import { WorkingHoursService } from './working_hours.service';
import { ApiTags } from '@nestjs/swagger';
import { WorkingHour } from './entities/working_hour.entity';

@ApiTags('working_hours')
@Controller('shop')
export class WorkingHoursController {
  constructor(
    private readonly shopService: ShopService,
    private readonly workingHoursService: WorkingHoursService
  ) {}

  @Post(':id/working_hours')
  async createWorkingHours(
    @Param('id') id: number,
    @Body() createWorkingHoursDto: CreateWorkingHoursDto
  ): Promise<WorkingHour> {
    const shop = await this.shopService.findOne(id);

    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found`);
    }

    return await this.workingHoursService.create({
      ...createWorkingHoursDto,
      shop,
    });
  }

  @Get(':id/working_hours')
  findWHByShop(@Param('id') id: number): Promise<WorkingHour[]> {
    return this.workingHoursService.findAllById(id);
  }

  @Patch(':id/working_hours')
  async updateWorkingHours(
    @Param('id') id: number,
    @Body() updateWorkingHoursDto: UpdateWorkingHoursDto
  ): Promise<WorkingHour> {
    const shop = await this.shopService.findOne(id);

    if (!shop) {
      throw new NotFoundException(`Shop with id ${id} not found`);
    }

    return this.workingHoursService.update(id, updateWorkingHoursDto);
  }
}
