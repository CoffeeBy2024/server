import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [SendgridModule, ConfigModule],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
