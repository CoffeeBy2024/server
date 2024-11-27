import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordRecoveryVerificationLink1728910895864
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordRecoveryVerificationLink" VARCHAR(255) NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "passwordRecoveryVerificationLink"`
    );
  }
}
