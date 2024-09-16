import { LoginUserDto, RegisterUserDto } from '@auth/dto';
import { Token } from '@auth/entities';
import { GoogleUserInfo, GoogleUserValidateResponse } from '@auth/types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '@user/entities';
import { googleDto, mockUser, passwordDto } from '@user/mocks';
import { of } from 'rxjs';
import { ObjectLiteral, Repository } from 'typeorm';

export type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

export enum mockAgents {
  POSTMAN = 'postman',
  INSOMNIA = 'insomnia',
}

const mockConfigData = {
  JWT_REFRESH_EXP: 100000000,
  JWT_ACCESS_SECRET: 'secret-secret',
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
  HTTP_TIMEOUT: 1,
  HTTP_MAX_REDIRECTS: 1,
};

export const mockNow = Date.now();

const dateResult = new Date(mockNow + mockConfigData['JWT_REFRESH_EXP']);

export const mockToken: Token = {
  id: 1,
  expiresAt: dateResult,
  userAgent: mockAgents.POSTMAN,
  value: 'wdfcqtrewvtwertvwt',
  user: mockUser,
};

export const createMockToken = (): Token => ({
  id: 1,
  expiresAt: dateResult,
  userAgent: mockAgents.POSTMAN,
  value: 'wdfcqtrewvtwertvwt',
  user: mockUser,
});

export const tokenBase = {
  id: 1,
};

export const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn().mockResolvedValue(mockToken),
  findOneBy: jest.fn().mockResolvedValue(mockToken),
  create: jest.fn().mockImplementation((dto) => {
    return { ...tokenBase, ...dto };
  }),
  save: jest.fn().mockImplementation((token) => Promise.resolve(token)),
  remove: jest.fn().mockImplementation((token) => Promise.resolve(token)),
});

export const mockRegisterUserDto: RegisterUserDto = {
  email: passwordDto.email,
  password: passwordDto.password as string,
  confirmPassword: passwordDto.password as string,
  firstName: passwordDto.firstName,
  lastName: passwordDto.lastName as string,
};

export const mockLoginUserDto: LoginUserDto = {
  email: passwordDto.email,
  password: passwordDto.password as string,
};

export const mockProvider: Provider = Provider.PASSWORD;

export const mockUserWithoutPassword = { ...mockUser, password: null };

export const mockGoogleUserValidateResponse: GoogleUserValidateResponse = {
  accessToken: 'accessToken',
};

export const mockGoogleUserInfo: GoogleUserInfo = {
  email: googleDto.email,
  email_verified: googleDto.emailVerified,
  family_name: googleDto.firstName,
  given_name: googleDto.lastName as string,
  locale: '',
  picture: 'some-link',
  sub: 'unique-id',
  name: `${googleDto.firstName} ${googleDto.lastName}`,
};

export const configServiceProvider = () => ({
  provide: ConfigService,
  useValue: {
    get: jest
      .fn()
      .mockImplementation(
        (key: keyof typeof mockConfigData) => mockConfigData[key]
      ),
  },
});

export const tokenRepositoryProvider = () => ({
  provide: getRepositoryToken(Token),
  useValue: createMockRepository(),
});

export const generateJwtToken = ({
  id,
  email,
}: {
  id: number;
  email: string;
}) => `jwt-token-${id}${email}`;

export const jwtServiceProvider = () => ({
  provide: JwtService,
  useValue: {
    sign: jest
      .fn()
      .mockImplementation((userData: { id: number; email: string }) =>
        generateJwtToken(userData)
      ),
  },
});

export const httpServiceProvider = () => ({
  provide: HttpService,
  useValue: {
    get: jest.fn().mockReturnValue(of({ data: mockGoogleUserInfo })),
  },
});
