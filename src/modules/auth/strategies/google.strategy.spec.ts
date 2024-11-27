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
    it('should call configService.getOrThrow method', () => {
      expect(configService.getOrThrow).toHaveBeenCalledTimes(3);
      expect(configService.getOrThrow).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'GOOGLE_CLIENT_SECRET'
      );
      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'GOOGLE_REDIRECT_URL'
      );
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
