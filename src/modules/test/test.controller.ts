import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  create(@Body() createTestDto: CreateTestDto) {
    return this.testService.create(createTestDto);
  }

  @Get()
  findAll() {
    return this.testService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.testService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.testService.remove(id);
  }
}
