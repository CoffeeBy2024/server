import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPhoto, ShopPhoto } from './entities/photo.entity';
import { PhotoController } from './photo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShopPhoto, ProductPhoto], 'mongodb')],
  controllers: [PhotoController],
  providers: [PhotoService],
  exports: [PhotoService],
})
export class PhotoModule {}
