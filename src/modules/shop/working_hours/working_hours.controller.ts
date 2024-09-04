import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateWorkingHoursDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHoursDto } from './dto/update-working_hour.dto';
import { ShopService } from '../shop/shop.service';
import { WorkingHoursService } from './working_hours.service';
import { ApiTags } from '@nestjs/swagger';

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
  ) {
    const shop = this.shopService.handleNonExistingShop(
      id,
      await this.shopService.findOne(id)
    );

    await this.shopService.createWorkingHours(shop);

    return this.workingHoursService.ensureWH(
      await this.workingHoursService.create({
        ...createWorkingHoursDto,
        shop: shop,
      })
    );
  }

  @Get(':id/working_hours')
  findWHByShop(@Param('id') id: number) {
    return this.workingHoursService.findAllById(id);
  }

  @Patch(':id/working_hours')
  async updateWorkingHours(
    @Param('id') id: number,
    @Body() updateWorkingHours: UpdateWorkingHoursDto
  ) {
    this.shopService.handleNonExistingShop(
      id,
      await this.shopService.findOne(id)
    );
    return this.workingHoursService.update(id, updateWorkingHours);
  }
}
