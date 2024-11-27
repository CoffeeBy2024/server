import { Test, TestingModule } from '@nestjs/testing';
import { PhotoService } from './photo.service';
import { ProductPhoto as Photo } from '../photo/entities/photo.entity';
import {
  productPhotoMock,
  productPhotoRepositoryProvider,
  shopPhotoRepositoryProvider,
} from './mocks/photoProvider';
import { ObjectLiteral, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

describe('PhotoService', () => {
  let service: PhotoService;
  let photoRepository: MockRepository<Photo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PhotoService,
        shopPhotoRepositoryProvider,
        productPhotoRepositoryProvider,
      ],
    }).compile();

    service = module.get<PhotoService>(PhotoService);
    photoRepository = module.get<MockRepository<Photo>>(
      getRepositoryToken(Photo, 'mongodb')
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Remove', () => {
    it('should remove concrete product', async () => {
      photoRepository.delete?.mockResolvedValue({ affected: 1 });

      const id = productPhotoMock._id.toString();

      const result = await service.remove(id, 'product');

      expect(photoRepository.delete).toHaveBeenCalled();
      expect(photoRepository.delete).toHaveBeenCalledWith({
        _id: new ObjectId(id),
      });
      expect(result).toEqual(true);
    });
  });
});
