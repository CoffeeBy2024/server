import { Injectable } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductPhoto, ShopPhoto } from './entities/photo.entity';
import { InjectRepository } from '@nestjs/typeorm';

export type PhotoType = 'product' | 'shop';

@Injectable()
export class PhotoService {
  constructor(
    @InjectRepository(ProductPhoto, 'mongodb')
    private readonly productPhotoRepository: MongoRepository<ProductPhoto>,

    @InjectRepository(ShopPhoto, 'mongodb')
    private readonly shopPhotoRepository: MongoRepository<ShopPhoto>
  ) {}

  private getRepository(type: PhotoType) {
    return type === 'product'
      ? this.productPhotoRepository
      : this.shopPhotoRepository;
  }

  async create(createPhotoDto: CreatePhotoDto, type: PhotoType) {
    const repository = this.getRepository(type);
    return await repository.save(repository.create(createPhotoDto));
  }

  async findAll(ids: string[], type: PhotoType) {
    const repository = this.getRepository(type);

    const transformedIds = ids.map((id) => (id ? new ObjectId(id) : undefined));

    const photos = await repository.find({
      _id: { $in: transformedIds },
    });

    return transformedIds.map((id, index) =>
      ids[index] ? photos.shift()?.image : undefined
    );
  }

  async findOne(id: string, type: PhotoType) {
    const repository = this.getRepository(type);

    const photo = await repository.findOneBy({
      _id: new ObjectId(id),
    });

    return photo?.image;
  }

  async update(id: string, updatePhotoDto: UpdatePhotoDto, type: PhotoType) {
    const repository = this.getRepository(type);

    const existingPhoto = await repository.findOneBy({
      _id: new ObjectId(id),
    });

    const updatedPhoto = {
      ...existingPhoto,
      ...updatePhotoDto,
    };

    return await repository.save(updatedPhoto);
  }

  async remove(id: string, type: PhotoType) {
    const repository = this.getRepository(type);

    const deleteResult = await repository.delete({
      _id: new ObjectId(id),
    });

    return !!deleteResult.affected;
  }
}
