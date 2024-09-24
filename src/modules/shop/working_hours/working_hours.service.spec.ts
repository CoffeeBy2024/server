import { WorkingHour } from './entities/working_hour.entity';
import { WorkingHoursService } from './working_hours.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockWorkingHours,
  updateWokringHoursDto,
  updateWorkingHours,
  workingHoursDto,
  workingHoursRepositoryProvider,
} from './mocks/workingHoursProvider';
import { shopMock } from '../shop/mocks/shopProvider';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

describe('WorkingHoursService', () => {
  let service: WorkingHoursService;
  let workingHoursRepository: MockRepository<WorkingHour>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkingHoursService, workingHoursRepositoryProvider],
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
      workingHoursRepository.find?.mockResolvedValue([mockWorkingHours]);

      const shopId = shopMock.id;
      const result = await service.findAllById(shopId);

      expect(result).toEqual([mockWorkingHours]);
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
      workingHoursRepository.findOneBy?.mockResolvedValue(mockWorkingHours);
      workingHoursRepository.save?.mockResolvedValue(updateWorkingHours);

      const result = await service.update(
        mockWorkingHours.id,
        updateWokringHoursDto
      );

      expect(result).toEqual(updateWorkingHours);
      expect(workingHoursRepository.findOneBy).toHaveBeenCalledWith({
        shop: { id: mockWorkingHours.id },
      });
      expect(workingHoursRepository.save).toHaveBeenCalledWith(
        updateWorkingHours
      );
    });

    it('should throw NotFoundException due to not-found Working Hours', async () => {
      workingHoursRepository.findOneBy?.mockResolvedValue(null);

      try {
        await service.update(mockWorkingHours.id + 1, updateWokringHoursDto);
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual('Working Hours were not found');
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
