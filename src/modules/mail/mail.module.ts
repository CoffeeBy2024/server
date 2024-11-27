import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { MailService } from './mail.service';

@Module({
  imports: [SendgridModule, ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
