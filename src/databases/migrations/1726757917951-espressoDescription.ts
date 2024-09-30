import { MigrationInterface, QueryRunner } from 'typeorm';

export class EspressoDescription1726757609436 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE product SET description = 'nice and clean' WHERE price = 8.99`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE product SET description = NULL WHERE price = 8.99`
    );
  }
}
