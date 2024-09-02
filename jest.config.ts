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
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    '^@sendgrid/mail$': '@sendgrid/mail',
    ...pathsToModuleNameMapper(compilerOptions.paths),
  },
};

export default jestConfig;
