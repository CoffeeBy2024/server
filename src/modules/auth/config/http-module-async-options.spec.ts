import { configServiceProvider } from '@auth/mocks';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { httpModuleAsyncOptions } from './http-module-async-options';

describe('httpModuleAsyncOptions', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [configServiceProvider()],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should return ConfigService injection', () => {
    const options = httpModuleAsyncOptions();

    expect(options.inject).toEqual([ConfigService]);
  });
  it('should call configService.get method', async () => {
    const options = httpModuleAsyncOptions();
    await options.useFactory?.(configService);

    expect(configService.get).toHaveBeenCalledTimes(2);
    expect(configService.get).toHaveBeenCalledWith('HTTP_TIMEOUT');
    expect(configService.get).toHaveBeenCalledWith('HTTP_MAX_REDIRECTS');
  });
  it('should return correct factory', async () => {
    const options = httpModuleAsyncOptions();
    const factoryResult = await options.useFactory?.(configService);

    expect(factoryResult).toEqual({
      timeout: configService.get('HTTP_TIMEOUT'),
      maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
    });
  });
});
