import { PartialType } from '@nestjs/swagger';
import { CreateWorkingHoursDto } from './create-working_hour.dto';

export default class UpdateWorkingHoursDto extends PartialType(
  CreateWorkingHoursDto
) {}
