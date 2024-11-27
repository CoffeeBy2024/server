import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

const jwtModuleOptions = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
  signOptions: {
    expiresIn: configService.getOrThrow<string>('JWT_ACCESS_EXP'),
  },
});

export const jwtModuleAsyncOptions = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) =>
    jwtModuleOptions(configService),
});
