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
    const { day_of_the_week, shop } = createWorkingHoursDto;
    const WHrepeatition = await this.workingHoursRepository.findOne({
      where: { day_of_the_week: day_of_the_week, shop: shop },
    });
    if (WHrepeatition)
      throw new Error(
        `Working Hours for ${day_of_the_week} day in ${shop.id} shop already exists`
      );

    return await this.workingHoursRepository.save(
      this.workingHoursRepository.create(createWorkingHoursDto)
    );
  }

  async findAllById(id: number) {
    return await this.workingHoursRepository.find({
      where: { shop: { id } },
    });
  }

  async update(id: number, updateWorkingHoursDto: UpdateWorkingHoursDto) {
    return await this.workingHoursRepository.save({
      ...this.ensureWH(await this.workingHoursRepository.findOneBy({ id: id })),
      ...updateWorkingHoursDto,
    });
  }

  ensureWH(workingHour: WorkingHour | null): WorkingHour {
    if (!workingHour) {
      console.error('Trying to reach non-existing working_hour');
      throw new Error('Trying to reach non-existing working_hour');
    }
    return workingHour;
  }
}
