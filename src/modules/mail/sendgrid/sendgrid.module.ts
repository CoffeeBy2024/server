import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [ConfigModule, MailModule],
  providers: [SendgridService],
  exports: [SendgridService],
})
export class SendgridModule {}
