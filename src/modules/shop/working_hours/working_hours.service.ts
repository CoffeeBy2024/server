import { Injectable } from '@nestjs/common';
import { CreateWorkingHoursDto } from './dto/create-working_hour.dto';
import UpdateWorkingHoursDto from './dto/update-working_hour.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';

@Injectable()
export class WorkingHoursService {
  constructor(
    @InjectRepository(WorkingHour)
    private workingHoursRepository: Repository<WorkingHour>
  ) {}

  async create(createWorkingHoursDto: CreateWorkingHoursDto) {
    const workingHours = this.workingHoursRepository.create(
      createWorkingHoursDto
    );
    return await this.workingHoursRepository.save(workingHours);
  }

  async update(id: number, updateWorkingHoursDto: UpdateWorkingHoursDto) {
    const existingWorkingHours = await this.workingHoursRepository.findOneBy({
      id: id,
    });
    if (!existingWorkingHours)
      throw new Error('Information about Wokring Hours was Not Found');
    const updatedWorkingHours = {
      ...existingWorkingHours,
      ...updateWorkingHoursDto,
    };
    return await this.workingHoursRepository.save(updatedWorkingHours);
  }
}
