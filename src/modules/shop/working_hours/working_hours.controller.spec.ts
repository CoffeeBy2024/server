import { Test } from '@nestjs/testing';
import { WorkingHoursController } from './working_hours.controller';
import { WorkingHoursService } from './working_hours.service';
import { ShopService } from '../shop/shop.service';
import UpdateWorkingHoursDto from './dto/update-working_hour.dto';

import {
  shopMock as shop,
  shopRepositoryProvider,
} from '../shop/mocks/shopProvider';
import {
  arrMockWorkingHours,
  mockWorkingHours,
  updateWorkingHours,
  workingHoursRepositoryProvider,
} from './mocks/workingHoursProvider';

describe('WorkingHoursController', () => {
  let controller: WorkingHoursController;
  let spyService: WorkingHoursService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WorkingHoursController],
      providers: [
        WorkingHoursService,
        ShopService,
        shopRepositoryProvider,
        workingHoursRepositoryProvider,
      ],
    }).compile();

    controller = module.get<WorkingHoursController>(WorkingHoursController);
    spyService = module.get<WorkingHoursService>(WorkingHoursService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET Working Hours', () => {
    it('should get working hours for concrete shop', async () => {
      jest
        .spyOn(spyService, 'findAllById')
        .mockResolvedValue(arrMockWorkingHours);

      const result = await controller.findWHByShop(shop.id);

      expect(spyService.findAllById).toHaveBeenCalled();
      expect(spyService.findAllById).toHaveBeenCalledWith(shop.id);
      expect(result).toBe(arrMockWorkingHours);
    });
  });

  describe('POST Wokring Hours', () => {
    it('should post working hours for concrete shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(mockWorkingHours);

      const result = await controller.createWorkingHours(
        shop.id,
        mockWorkingHours
      );

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(mockWorkingHours);
      expect(result).toBe(mockWorkingHours);
    });
  });

  describe('PATCH Wokring Hours', () => {
    it('should update working hours for concrete shop', async () => {
      jest
        .spyOn(spyService, 'update')
        .mockImplementation(
          (id: number, updateWorkingHoursDto: UpdateWorkingHoursDto) => {
            return Promise.resolve({
              ...mockWorkingHours,
              ...updateWorkingHoursDto,
            });
          }
        );

      const result = await controller.updateWorkingHours(
        shop.id,
        updateWorkingHours
      );

      expect(spyService.update).toHaveBeenCalled();
      expect(spyService.update).toHaveBeenCalledWith(
        shop.id,
        updateWorkingHours
      );
      expect(result).toEqual(updateWorkingHours);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
