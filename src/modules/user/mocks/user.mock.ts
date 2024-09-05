import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from '@user/dto';
import { Provider, User } from '@user/entities';
import { ObjectLiteral, Repository } from 'typeorm';

export const mockUser: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Davidson',
  email: 'fdgdfdg@gmail.com',
  password: '123123123',
  provider: Provider.PASSWORD,
  emailVerified: false,
  emailVerificationLink: '3c039007-070d-41ab-a067-36706152a783',
  location: null,
  tokens: [],
};

export const mockUserGoogle: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Davidson',
  email: 'fdgdfdg@gmail.com',
  password: null,
  provider: Provider.GOOGLE,
  emailVerified: true,
  emailVerificationLink: null,
  location: null,
  tokens: [],
};

export const passwordDto: CreateUserDto = {
  firstName: 'John',
  lastName: 'Davidson',
  email: 'fdgdfdg@gmail.com',
  password: '123123123',
  provider: Provider.PASSWORD,
  emailVerified: false,
  emailVerificationLink: '3c039007-070d-41ab-a067-36706152a783',
};

export const googleDto: CreateUserDto = {
  firstName: 'John',
  lastName: 'Davidson',
  email: 'fdgdfdg@gmail.com',
  provider: Provider.GOOGLE,
  emailVerified: true,
};

export const userArr: User[] = [
  { ...mockUser, id: 2, email: 'John@gmail.com' },
  { ...mockUser, id: 3, email: 'John1@gmail.com' },
];

export const updateUserDto: UpdateUserDto = {
  firstName: 'Bob',
  password: 'newOne',
};

export const userBase = {
  id: 1,
  lastName: null,
  password: null,
  emailVerificationLink: null,
  location: null,
  tokens: [],
};

export type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

export const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn().mockResolvedValue(mockUser),
  findOneBy: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockImplementation((dto) => {
    return { ...userBase, ...dto, password: dto.password || null };
  }),
  save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
  find: jest.fn().mockResolvedValue(userArr),
  remove: jest.fn().mockImplementation((user) => Promise.resolve(user)),
});

export const userRepositoryProvider = () => ({
  provide: getRepositoryToken(User),
  useValue: createMockRepository(),
});
