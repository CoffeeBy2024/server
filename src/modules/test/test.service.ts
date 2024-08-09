import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>
  ) {}

  async create(createTestDto: CreateTestDto) {
    const test = this.testRepository.create(createTestDto);
    return await this.testRepository.save(test);
  }

  async findAll() {
    const tests = await this.testRepository.find();
    return `This action returns all tests - ${JSON.stringify(tests)}`;
  }

  async findOne(id: number) {
    const test = await this.testRepository.findOneBy({ id: id });
    return `This action return a #${id} ${test ? JSON.stringify(test) : 'Non-Existing'} test`;
  }

  async remove(id: number) {
    const test = await this.testRepository.delete({ id: id });
    return `This action removes a #${id} ${test.affected && test.affected > 0 ? '' : 'Non-Existing'} test`;
  }
}
