import { pathsToModuleNameMapper } from 'ts-jest';
import type { JestConfigWithTsJest } from 'ts-jest';
import * as ts from 'typescript';
import * as path from 'path';

const configFile = ts.readConfigFile(
  path.resolve(__dirname, 'tsconfig.json'),
  ts.sys.readFile
);
const compilerOptions = configFile.config.compilerOptions;

const jestConfig: JestConfigWithTsJest = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  coveragePathIgnorePatterns: [
    'main.ts',
    '<rootDir>/modules/app',
    '.entity.ts',
    '.module.ts',
  ],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths),
  },
};

export default jestConfig;
