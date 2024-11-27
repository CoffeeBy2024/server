import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhotoToShop1728031721379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE shop ADD photo VARCHAR(24)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE shop DROP COLUMN photo`);
  }
}
