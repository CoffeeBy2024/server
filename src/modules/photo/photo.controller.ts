import { Controller, Get, Param } from '@nestjs/common';
import { PhotoService, PhotoType } from './photo.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('photos')
@Controller('photos/:id')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get()
  findById(@Param('id') id: string, type: PhotoType) {
    return this.photoService.findOne(id, type);
  }
}
