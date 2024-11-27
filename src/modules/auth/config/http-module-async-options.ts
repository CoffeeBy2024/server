import { HttpModuleAsyncOptions, HttpModuleOptions } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

const httpModuleOptions = (
  configService: ConfigService
): HttpModuleOptions => ({
  timeout: configService.get('HTTP_TIMEOUT'),
  maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
});

export const httpModuleAsyncOptions = (): HttpModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) =>
    httpModuleOptions(configService),
});
