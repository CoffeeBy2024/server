import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthGuard } from './google-auth.guard';
import { Test, TestingModule } from '@nestjs/testing';

describe('GoogleAuthGuard', () => {
  let googleAuthGuard: GoogleAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleAuthGuard],
    }).compile();

    googleAuthGuard = module.get<GoogleAuthGuard>(GoogleAuthGuard);
  });

  it('should be defined', () => {
    expect(googleAuthGuard).toBeDefined();
  });

  it('should use the google strategy', () => {
    expect(googleAuthGuard).toBeInstanceOf(AuthGuard('google'));
  });
});
