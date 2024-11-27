import { LoginUserDto, RegisterUserDto } from '@auth/dto';
import { Token } from '@auth/entities';
import {
  GoogleUserInfo,
  GoogleUserValidateResponse,
  JWTPayload,
} from '@auth/types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MailService } from '@mail/mail.service';
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

export const mockConfigData = {
  JWT_REFRESH_EXP: 100000000,
  JWT_ACCESS_SECRET: 'secret-secret',
  JWT_ACCESS_EXP: 10000,
  GOOGLE_CLIENT_ID: 'GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
  HTTP_TIMEOUT: 1,
  HTTP_MAX_REDIRECTS: 1,
  API_URL: 'https://api-url',
  CLIENT_URL: 'https://client-url',
  SENDGRID_EMAIL_FROM: 'SENDGRID_EMAIL_FROM',
};

export const mockNow = Date.now();

export const refreshTokenExpiresAt = new Date(
  mockNow + mockConfigData.JWT_REFRESH_EXP
);
export const accessTokenExpiresAt = new Date(
  mockNow + mockConfigData.JWT_ACCESS_EXP
);

export const generateJwtToken = (data: { sub: number }) =>
  `jwt-token-${data.sub}`;

export const mockAccessToken = {
  value: generateJwtToken({ sub: mockUser.id }),
  expiresAt: accessTokenExpiresAt,
};

export const mockRefreshToken: Token = {
  id: 1,
  expiresAt: refreshTokenExpiresAt,
  userAgent: mockAgents.POSTMAN,
  value: 'mock-refreshToken',
  user: mockUser,
};

export const mockTokensResult = {
  accessToken: mockAccessToken,
  refreshToken: mockRefreshToken,
};

export const mockJWTPayload: JWTPayload = {
  sub: mockUser.id,
  exp: Date.now(),
  iat: Date.now(),
};

export const tokenBase = {
  id: 1,
};

export const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn().mockResolvedValue(mockRefreshToken),
  findOneBy: jest.fn().mockResolvedValue(mockRefreshToken),
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
    getOrThrow: jest
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

export const jwtServiceProvider = () => ({
  provide: JwtService,
  useValue: {
    sign: jest
      .fn()
      .mockImplementation((userData: { sub: number }) =>
        generateJwtToken({ sub: userData.sub })
      ),
  },
});

export const httpServiceProvider = () => ({
  provide: HttpService,
  useValue: {
    get: jest.fn().mockReturnValue(of({ data: mockGoogleUserInfo })),
  },
});

export const mockAccessTokenDto = {
  accessToken: 'access-token',
};

const getMockMailService = () => ({
  verifyPasswordRecovery: jest.fn(),
  verifyEmail: jest.fn(),
});
const mockMailService = getMockMailService();
export type MockMailServiceType = typeof mockMailService;

export const provideMockMailService = () => ({
  provide: MailService,
  useValue: getMockMailService(),
});
