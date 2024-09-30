import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceImageWithPhoto1727085609607 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE product DROP COLUMN image`);
    await queryRunner.query(`ALTER TABLE product ADD photo VARCHAR(24)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE product ADD COLUMN image BYTEA`);
    await queryRunner.query(`ALTER TABLE product DROP COLUMN photo`);
  }
}
