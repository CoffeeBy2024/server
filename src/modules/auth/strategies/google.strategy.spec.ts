import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';
import { ConfigService } from '@nestjs/config';
import { configServiceProvider } from '@auth/mocks';
import { Profile } from 'passport-google-oauth20';

const mockGoogleAccessToken = 'mockGoogleAccessToken';
const mockGoogleRefreshToken = 'mockGoogleRefreshToken';
const mockGoogleProfile = {} as Profile;
const mockDone = jest.fn();

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleStrategy, configServiceProvider()],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(googleStrategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('constructor', () => {
    it('should call configService.get method', () => {
      expect(configService.get).toHaveBeenCalledTimes(2);
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
    });
  });

  describe('validate', () => {
    it('should call done with the correct user object', async () => {
      await googleStrategy.validate(
        mockGoogleAccessToken,
        mockGoogleRefreshToken,
        mockGoogleProfile,
        mockDone
      );

      expect(mockDone).toHaveBeenCalledTimes(1);
      expect(mockDone).toHaveBeenCalledWith(null, {
        accessToken: mockGoogleAccessToken,
      });
    });
  });
});
