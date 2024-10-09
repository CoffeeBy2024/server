import { Test, TestingModule } from '@nestjs/testing';
import { PhotoController } from './photo.controller';
import { PhotoService, PhotoType } from './photo.service';
import { photoDto } from './mocks/photoProvider';

describe('PhotoController', () => {
  let controller: PhotoController;
  let service: PhotoService;
  const type: PhotoType = 'product';

  const mockPhotoService = {
    findOne: jest.fn((id: string, type: PhotoType) => {
      return type === 'product' ? { id, image: photoDto } : 'wrong Type';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PhotoController],
      providers: [
        {
          provide: PhotoService,
          useValue: mockPhotoService,
        },
      ],
    }).compile();

    controller = module.get<PhotoController>(PhotoController);
    service = module.get<PhotoService>(PhotoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findById', () => {
    it('should call PhotoService.findOne with the correct parameters', () => {
      const id = '1';

      controller.findById(id, type);

      expect(service.findOne).toHaveBeenCalledWith(id, type);
    });

    it('should return the result from PhotoService.findOne', () => {
      const id = '1';

      const result = controller.findById(id, type);

      expect(result).toEqual({ id, image: photoDto });
    });
  });
});
