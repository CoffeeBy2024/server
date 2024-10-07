import { Test } from '@nestjs/testing';
import { WorkingHoursController } from './working_hours.controller';
import { WorkingHoursService } from './working_hours.service';
import { ShopService } from '../shop/shop.service';
import { UpdateWorkingHoursDto } from './dto/update-working_hour.dto';

import {
  shopMock as shop,
  shopMock,
  shopRepositoryProvider,
} from '../shop/mocks/shopProvider';
import {
  mockWorkingHours,
  updateWorkingHours,
  workingHoursDto,
  workingHoursRepositoryProvider,
} from './mocks/workingHoursProvider';
import { NotFoundException } from '@nestjs/common';
import { PhotoService } from '../../photo/photo.service';
import {
  productPhotoRepositoryProvider,
  shopPhotoRepositoryProvider,
} from '../../photo/mocks/photoProvider';

describe('WorkingHoursController', () => {
  let controller: WorkingHoursController;
  let spyService: WorkingHoursService;
  let shopService: ShopService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [WorkingHoursController],
      providers: [
        WorkingHoursService,
        ShopService,
        PhotoService,
        shopPhotoRepositoryProvider,
        productPhotoRepositoryProvider,
        shopRepositoryProvider,
        workingHoursRepositoryProvider,
      ],
    }).compile();

    controller = module.get<WorkingHoursController>(WorkingHoursController);
    spyService = module.get<WorkingHoursService>(WorkingHoursService);
    shopService = module.get<ShopService>(ShopService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET Working Hours', () => {
    it('should get working hours for concrete shop', async () => {
      jest
        .spyOn(spyService, 'findAllById')
        .mockResolvedValue([mockWorkingHours]);

      const result = await controller.findByShop(shop.id);

      expect(spyService.findAllById).toHaveBeenCalled();
      expect(spyService.findAllById).toHaveBeenCalledWith(shop.id);
      expect(result).toEqual([mockWorkingHours]);
    });
  });

  describe('POST Wokring Hours', () => {
    it('should post working hours for concrete shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(mockWorkingHours);

      const result = await controller.create(shop.id, mockWorkingHours);

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(mockWorkingHours);
      expect(result).toBe(mockWorkingHours);
    });

    it('should thow NotFoundException due to not-found shop', async () => {
      jest.spyOn(shopService, 'findOne').mockResolvedValue(null);

      try {
        await controller.create(shopMock.id, workingHoursDto);
        expect(false).toBeTruthy(); // we should never hit this line
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(`Shop with id ${shopMock.id} not found`);
      }
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

      const result = await controller.update(shop.id, updateWorkingHours);

      expect(spyService.update).toHaveBeenCalled();
      expect(spyService.update).toHaveBeenCalledWith(
        shop.id,
        updateWorkingHours
      );
      expect(result).toEqual(updateWorkingHours);
    });

    it('should throw NotFoundException due to not-found shop', async () => {
      jest.spyOn(shopService, 'findOne').mockResolvedValue(null);

      try {
        await controller.update(shopMock.id, updateWorkingHours);
        expect(false).toBeTruthy(); // we should never hit this line
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(`Shop with id ${shopMock.id} not found`);
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
