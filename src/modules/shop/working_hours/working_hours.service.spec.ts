import { WorkingHour } from './entities/working_hour.entity';
import { WorkingHoursService } from './working_hours.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  arrMockWorkingHours,
  mockWorkingHours,
  updateWorkingHours,
  workingHoursDto,
} from './mocks/workingHoursProvider';
import { shopMock } from '../shop/mocks/shopProvider';
import UpdateWorkingHoursDto from './dto/update-working_hour.dto';
import { ObjectLiteral, Repository } from 'typeorm';

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

describe('WorkingHoursService', () => {
  let service: WorkingHoursService;
  let workingHoursRepository: MockRepository<WorkingHour>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkingHoursService,
        {
          provide: getRepositoryToken(WorkingHour),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = await module.resolve<WorkingHoursService>(WorkingHoursService);
    workingHoursRepository = module.get<MockRepository<WorkingHour>>(
      getRepositoryToken(WorkingHour)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create', () => {
    it('should create Working Hours object', async () => {
      workingHoursRepository.findOne?.mockResolvedValue(null);
      workingHoursRepository.create?.mockResolvedValue(mockWorkingHours);

      const result = await service.create(workingHoursDto);

      expect(result).toEqual(mockWorkingHours);
      expect(workingHoursRepository.create).toHaveBeenCalledWith(
        workingHoursDto
      );
    });

    it('should throw error due to already existing', async () => {
      workingHoursRepository.findOne?.mockResolvedValue(mockWorkingHours);

      await expect(service.create(workingHoursDto)).rejects.toThrow(
        `Working Hours for ${workingHoursDto.day_of_the_week} day in ${workingHoursDto.shop.id} shop already exists`
      );

      expect(workingHoursRepository.create).not.toHaveBeenCalled();
      expect(workingHoursRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllById', () => {
    it('should find Working Hours for concrete shop', async () => {
      workingHoursRepository.find?.mockResolvedValue(arrMockWorkingHours);

      const shopId = shopMock.id;
      const result = await service.findAllById(shopId);

      expect(result).toEqual(arrMockWorkingHours);
      expect(workingHoursRepository.find).toHaveBeenCalledWith({
        where: { shop: { id: shopId } },
      });
    });

    it('should return an empty array for a non-existent shop ID', async () => {
      workingHoursRepository.find?.mockResolvedValue([]);

      const nonExistentShopId = shopMock.id + 1;
      const result = await service.findAllById(nonExistentShopId);

      expect(result).toEqual([]);
      expect(workingHoursRepository.find).toHaveBeenCalledWith({
        where: { shop: { id: nonExistentShopId } },
      });
    });
  });

  describe('update', () => {
    it('should update Working Hour', async () => {
      const updateDto: UpdateWorkingHoursDto = { open_hour: '08:15' };

      workingHoursRepository.findOneBy?.mockResolvedValue(mockWorkingHours);
      workingHoursRepository.save?.mockResolvedValue(updateWorkingHours);

      const result = await service.update(mockWorkingHours.id, updateDto);

      expect(result).toEqual(updateWorkingHours);
      expect(workingHoursRepository.findOneBy).toHaveBeenCalledWith({
        id: mockWorkingHours.id,
      });
      expect(workingHoursRepository.save).toHaveBeenCalledWith(
        updateWorkingHours
      );
    });
  });

  describe('ensureWH', () => {
    it('should return the WorkingHour object if it exists', () => {
      const result = service.ensureWH(mockWorkingHours);

      expect(result).toBe(mockWorkingHours);
    });

    it('should throw an error if WorkingHour does not exist', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => service.ensureWH(null)).toThrow(
        'Trying to reach non-existing working_hour'
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
