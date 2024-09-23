import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions, getMetadataArgsStorage } from 'typeorm';

ConfigModule.forRoot();
const configService = new ConfigService();

function getEntities() {
  return getMetadataArgsStorage()
    .tables.map((tbl) => tbl.target)
    .filter((entity) => entity.toString().toLowerCase().includes('entity'))
    .filter(
      (entity) =>
        !entity.toString().toLowerCase().includes('dist/**/photo.entity')
    );
}

export const dbdatasource: DataSourceOptions = {
  type: 'postgres',
  url: configService.get<string>('POSTGRES_URL'),
  synchronize: false,
  entities: getEntities(),
  migrations: ['dist/config/databases/postgres/migrations/**/*.js'],
  migrationsTableName: 'postgres-migrations',
};

const postgresDataSource = new DataSource(dbdatasource);
export default postgresDataSource;
