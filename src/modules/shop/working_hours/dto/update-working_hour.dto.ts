import { PartialType } from '@nestjs/swagger';
import { CreateWorkingHoursDto } from './create-working_hour.dto';

export class UpdateWorkingHoursDto extends PartialType(CreateWorkingHoursDto) {}
