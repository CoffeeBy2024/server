import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkingHoursDto } from './dto/create-working_hour.dto';
import { UpdateWorkingHoursDto } from './dto/update-working_hour.dto';
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
      where: { day_of_the_week, shop },
    });

    if (WHrepeatition)
      throw new BadRequestException(
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
    const existingWH = await this.workingHoursRepository.findOneBy({
      shop: { id },
    });

    if (!existingWH) {
      throw new NotFoundException('Working Hours were not found');
    }

    return await this.workingHoursRepository.save({
      ...existingWH,
      ...updateWorkingHoursDto,
    });
  }
}
