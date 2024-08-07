import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test.dto';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async create(@Body() createTestDto: CreateTestDto) {
    const createTest = await this.testService.create(createTestDto);
    return createTest;
  }

  @Get()
  async findAll() {
    const tests = await this.testService.findAll();
    return tests;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testService.remove(+id);
  }
}
