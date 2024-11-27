import { configServiceProvider } from '@auth/mocks';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { jwtModuleAsyncOptions } from './jwt-module-async-options';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

describe('jwtModuleAsyncOptions', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [configServiceProvider()],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  it('should return ConfigService injection', () => {
    const asyncOptions: JwtModuleAsyncOptions = jwtModuleAsyncOptions();

    expect(asyncOptions.inject).toEqual([ConfigService]);
  });

  it('should call configService.get method', async () => {
    const options = jwtModuleAsyncOptions();
    await options.useFactory?.(configService);

    expect(configService.get).toHaveBeenCalledTimes(2);
    expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
    expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_EXP');
  });

  it('should return correct factory', async () => {
    const asyncOptions: JwtModuleAsyncOptions = jwtModuleAsyncOptions();

    const factoryResult = await asyncOptions.useFactory?.(configService);

    expect(factoryResult).toEqual({
      secret: configService.get('JWT_ACCESS_SECRET'),
      signOptions: {
        expiresIn: configService.get('JWT_ACCESS_EXP'),
      },
    });
  });
});
