import { IsInstance, IsNotEmpty } from 'class-validator';

export class CreatePhotoDto {
  @IsNotEmpty()
  @IsInstance(Buffer)
  image: Buffer;
}
