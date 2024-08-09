import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkingHoursDto } from './create-working_hour.dto';

export default class UpdateWorkingHoursDto extends PartialType(
  CreateWorkingHoursDto
) {}
