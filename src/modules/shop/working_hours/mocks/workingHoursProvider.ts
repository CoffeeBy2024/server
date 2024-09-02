import { WorkingHour } from '../entities/working_hour.entity';
import { shopMock as shop } from '../../shop/mocks/shopProvider';
import { CreateWorkingHoursDto } from '../dto/create-working_hour.dto';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const workingHoursRepositoryProvider = {
  provide: getRepositoryToken(WorkingHour),
  useValue: Repository<WorkingHour>,
};

const workingHoursDto: CreateWorkingHoursDto = {
  day_of_the_week: 1,
  open_hour: '08:00',
  close_hour: '19:00',
  shop: shop,
};

const mockWorkingHours: WorkingHour = {
  id: 1,
  day_of_the_week: 1,
  open_hour: '08:00',
  close_hour: '19:00',
  shop: shop,
};

const arrMockWorkingHours: WorkingHour[] = [
  { ...mockWorkingHours, id: 1 },
  { ...mockWorkingHours, id: 2 },
];

const updateWorkingHours: WorkingHour = {
  ...mockWorkingHours,
  open_hour: '08:15',
};

export {
  workingHoursRepositoryProvider,
  workingHoursDto,
  mockWorkingHours,
  arrMockWorkingHours,
  updateWorkingHours,
};
