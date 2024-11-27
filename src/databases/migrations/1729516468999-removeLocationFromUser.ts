import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLocationFromUser1729516468999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "user" DROP COLUMN "location"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "user" ADD COLUMN "location" jsonb NULL'
    );
  }
}
