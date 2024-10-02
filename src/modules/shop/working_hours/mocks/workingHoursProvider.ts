import { WorkingHour } from '../entities/working_hour.entity';
import { shopMock as shop } from '../../shop/mocks/shopProvider';
import { CreateWorkingHoursDto } from '../dto/create-working_hour.dto';
import { ObjectLiteral, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateWorkingHoursDto } from '../dto/update-working_hour.dto';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest
    .fn()
    .mockImplementation((working_hours) => Promise.resolve(working_hours)),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

const workingHoursRepositoryProvider = {
  provide: getRepositoryToken(WorkingHour),
  useValue: createMockRepository(),
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

const updateWokringHoursDto: UpdateWorkingHoursDto = { open_hour: '08:15' };

const updateWorkingHours: WorkingHour = {
  ...mockWorkingHours,
  open_hour: '08:15',
};

export {
  workingHoursRepositoryProvider,
  workingHoursDto,
  mockWorkingHours,
  updateWokringHoursDto,
  updateWorkingHours,
};
