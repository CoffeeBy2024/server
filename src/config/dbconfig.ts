import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSourceOptions, getMetadataArgsStorage } from 'typeorm';

function getEntities() {
  return getMetadataArgsStorage()
    .tables.map((tbl) => tbl.target)
    .filter((entity) => entity.toString().toLowerCase().includes('entity'))
    .filter(
      (entity) =>
        !entity.toString().toLowerCase().includes('dist/**/photo.entity')
    );
}

ConfigModule.forRoot();
const configService = new ConfigService();

export default (): {
  postgres: DataSourceOptions;
  mongodb: DataSourceOptions;
} => {
  return {
    postgres: {
      type: 'postgres',
      url: configService.get<string>('POSTGRES_URL'),
      synchronize: false,
      entities: getEntities(),
      migrations: ['dist/databases/migrations/**/*.js'],
      migrationsTableName: 'postgres-migrations',
    },
    mongodb: {
      type: 'mongodb',
      name: 'mongodb',
      url: configService.get<string>('MONGODB_URL'),
      synchronize: false,
      entities: ['dist/**/photo.entity{.ts,.js}'],
      migrations: ['dist/databases/migrations/**/*.js'],
      migrationsTableName: 'mongodb-migrations',
    },
  };
};
