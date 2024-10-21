import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';

@Module({
  providers: [
    {
      provide: MailService,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.getOrThrow<string>('SENDGRID_API_KEY');

        const mailService = new MailService();
        mailService.setApiKey(apiKey);
        return mailService;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MailService],
})
export class MailModule {}
