import { ObjectId } from 'mongodb';
import { CreatePhotoDto } from '../dto/photo/create-photo.dto';
import { ObjectLiteral, Repository } from 'typeorm';
import { Photo } from '../entities/photo.entity';
import { Readable } from 'stream';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdatePhotoDto } from '../dto/photo/update-photo.dto';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
});

const photoRepositoryProvider = {
  provide: getRepositoryToken(Photo, 'mongodb'),
  useValue: createMockRepository(),
};

const fileMock: Express.Multer.File = {
  originalname: 'file.csv',
  mimetype: 'text/csv',
  path: 'something',
  buffer: Buffer.from('one,two,three'),
  fieldname: '',
  encoding: '',
  size: 0,
  stream: new Readable(),
  destination: '',
  filename: '',
};

const photoDto: CreatePhotoDto = {
  image: fileMock.buffer,
};

const updatePhotoDto: UpdatePhotoDto = {
  image: Buffer.from('three, two, one'),
};

const photoMock: Photo = {
  _id: new ObjectId('69f13c8fb5489b94041fd59e'),
  ...photoDto,
};

export {
  photoRepositoryProvider,
  fileMock,
  photoDto,
  updatePhotoDto,
  photoMock,
};
