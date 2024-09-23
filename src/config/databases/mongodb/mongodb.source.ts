import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

ConfigModule.forRoot();
const configService = new ConfigService();

export const dbdatasource: DataSourceOptions = {
  type: 'mongodb',
  name: 'mongodb',
  url: configService.get<string>('MONGODB_URL'),
  synchronize: false,
  entities: ['dist/**/photo.entity{.ts,.js}'],
  migrations: ['dist/config/databases/mongodb/migrations/**/*.js'],
  migrationsTableName: 'mongodb-migrations',
};

const mongodbDataSource = new DataSource(dbdatasource);
export default mongodbDataSource;
