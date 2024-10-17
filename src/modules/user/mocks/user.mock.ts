import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto, UpdateUserDto } from '@user/dto';
import { Provider, User } from '@user/entities';
import { ObjectLiteral, Repository } from 'typeorm';

export const password = '123123123';
export const hashedPassword = 'dewqrewdsdda';

export const passwordDto: CreateUserDto = {
  firstName: 'John',
  lastName: 'Davidson',
  email: 'password@gmail.com',
  password: password,
  provider: Provider.PASSWORD,
  emailVerified: false,
  emailVerificationLink: 'mock-uuid-value',
};

export const mockUser: User = {
  id: 1,
  firstName: passwordDto.firstName,
  lastName: passwordDto.lastName as string,
  email: passwordDto.email,
  password: hashedPassword,
  provider: passwordDto.provider,
  emailVerified: passwordDto.emailVerified,
  emailVerificationLink: passwordDto.emailVerificationLink as string,
  passwordRecoveryVerificationLink: null,
  location: null,
  tokens: [],
};

export const googleDto: CreateUserDto = {
  firstName: 'John',
  lastName: 'Davidson',
  email: 'google@gmail.com',
  provider: Provider.GOOGLE,
  emailVerified: true,
};

export const mockUserGoogle: User = {
  id: 1,
  firstName: googleDto.firstName,
  lastName: googleDto.lastName as string,
  email: googleDto.email,
  password: null,
  provider: googleDto.provider,
  emailVerified: googleDto.emailVerified,
  emailVerificationLink: null,
  passwordRecoveryVerificationLink: null,
  location: null,
  tokens: [],
};

export const updateUserDto: UpdateUserDto = {
  firstName: 'Bob',
};

export const userArr: User[] = [
  { ...mockUser, id: 2, email: 'John@gmail.com' },
  { ...mockUser, id: 3, email: 'John1@gmail.com' },
];

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

export const getMockCacheManager = () => ({
  get: jest.fn().mockResolvedValue(mockUser),
  set: jest.fn(),
  del: jest.fn().mockResolvedValue(mockUser),
});

export const provideMockCacheManager = () => ({
  provide: CACHE_MANAGER,
  useValue: getMockCacheManager(),
});
const cacheManagerProvider = getMockCacheManager();
export type MockCacheManagerType = typeof cacheManagerProvider;

export const mockGetUserCacheKey = (id: number) => `user_by_token_${id}`;
