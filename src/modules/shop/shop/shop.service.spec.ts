import { Test, TestingModule } from '@nestjs/testing';
import { ShopService } from './shop.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  shopDto,
  shopMock,
  shopRepositoryProvider,
  updatedShop,
} from './mocks/shopProvider';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

describe('ShopService', () => {
  let service: ShopService;
  let shopRepository: MockRepository<Shop>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopService, shopRepositoryProvider],
    }).compile();

    service = await module.resolve<ShopService>(ShopService);
    shopRepository = module.get<MockRepository<Shop>>(getRepositoryToken(Shop));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create', () => {
    it('should create shop', async () => {
      const result = await service.create(shopDto);

      expect(shopRepository.create).toHaveBeenCalledWith(shopDto);
      expect(shopRepository.save).toHaveBeenCalled();
      expect(result).toEqual(shopMock);
    });
  });

  describe('Find', () => {
    it('should find all shops', async () => {
      shopRepository.find?.mockResolvedValue([shopMock]);
      const result = await service.findAll();

      expect(result).toEqual([shopMock]);
      expect(shopRepository.find).toHaveBeenCalled();
      expect(shopRepository.find).toHaveBeenCalledWith();
    });

    it('should find shop by its name', async () => {
      shopRepository.find?.mockResolvedValue([shopMock]);

      const result = await service.findByName(shopMock.name);

      expect(result).toEqual([shopMock]);
      expect(shopRepository.find).toHaveBeenCalled();
      expect(shopRepository.find).toHaveBeenCalledWith({
        where: { name: shopMock.name },
      });
    });

    it('should find shop by id', async () => {
      shopRepository.findOneBy?.mockResolvedValue(shopMock);

      const result = await service.findOne(shopMock.id);

      expect(result).toEqual(shopMock);
      expect(shopRepository.findOneBy).toHaveBeenCalled();
      expect(shopRepository.findOneBy).toHaveBeenCalledWith({
        id: shopMock.id,
      });
    });
  });

  describe('Update', () => {
    it('should update shop', async () => {
      shopRepository.findOneBy?.mockResolvedValue(shopMock);
      shopRepository.save?.mockResolvedValue(updatedShop);

      const result = await service.update(shopMock.id, {
        name: updatedShop.name,
      });

      expect(result).toEqual(updatedShop);
      expect(shopRepository.findOneBy).toHaveBeenCalled();
      expect(shopRepository.findOneBy).toHaveBeenCalledWith({
        id: shopMock.id,
      });
      expect(shopRepository.save).toHaveBeenCalled();
      expect(shopRepository.save).toHaveBeenCalledWith(updatedShop);
    });
  });

  describe('Remove', () => {
    it('should remove shop', async () => {
      const result = await service.remove(shopMock.id);

      expect(shopRepository.delete).toHaveBeenCalled();
      expect(result).toEqual(true);
    });
  });

  describe('Handler', () => {
    it('should ensure that shop exists', () => {
      const result = service.handleNonExistingShop(shopMock.id, shopMock);

      expect(result).toEqual(shopMock);
    });

    it('should throw Error due to non-existing shop', () => {
      try {
        service.handleNonExistingShop(shopMock.id, null);
        expect(false).toBeTruthy(); // we should never hit this line
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toEqual(
          `Shop with id - ${shopMock.id} doesn't exist`
        );
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});