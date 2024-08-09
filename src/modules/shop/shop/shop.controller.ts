import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CreateWorkingHoursDto } from '../working_hours/dto/create-working_hour.dto';
import { WorkingHoursService } from '../working_hours/working_hours.service';
import UpdateWorkingHoursDto from '../working_hours/dto/update-working_hour.dto';

@Controller('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly workingHoursService: WorkingHoursService
  ) {}

  @Post(':id/working_hours')
  @UsePipes(new ValidationPipe())
  async createWorkingHours(
    @Param('id') id: number,
    @Body() createWorkingHoursDto: CreateWorkingHoursDto
  ) {
    const shop = await this.shopService.findOne(id);
    if (!shop) {
      console.error('Trying to add Working Hours to non-existing shop');
      throw new Error(`Shop with id - ${id} doesn't exist`);
    }

    createWorkingHoursDto.shop = shop;
    const workingHour = await this.workingHoursService.create(
      createWorkingHoursDto
    );
    if (!workingHour) {
      console.error(`Failed to create Working Hours Entity for ${id} shop`);
      throw new Error(`Working Hours for ${id} shop wasn't created`);
    }

    return this.shopService.createWorkingHours(shop);
  }

  @Get(':id/working_hours')
  findWHByShop(@Param('id') id: number) {
    return this.shopService.findWHByShop(id);
  }

  @Patch(':id/working_hours')
  async updateWorkingHours(
    @Param('id') id: number,
    @Body() updateWorkingHours: UpdateWorkingHoursDto
  ) {
    const shop = await this.shopService.findOne(id);
    if (!shop) {
      console.error('Trying to add Working Hours to non-existing shop');
      throw new Error(`Shop with id - ${id} doesn't exist`);
    }
    return this.workingHoursService.update(id, updateWorkingHours);
  }

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.shopService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.shopService.remove(id);
  }
}
