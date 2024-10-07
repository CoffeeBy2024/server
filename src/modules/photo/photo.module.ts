import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPhoto, ShopPhoto } from './entities/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopPhoto, ProductPhoto], 'mongodb')],
  providers: [PhotoService],
  exports: [PhotoService],
})
export class PhotoModule {}
