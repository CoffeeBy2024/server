import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';

@Module({
  providers: [
    {
      provide: MailService,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('SENDGRID_API_KEY');

        if (!apiKey) {
          throw new InternalServerErrorException(
            'SENDGRID_API_KEY is not defined'
          );
        }

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
