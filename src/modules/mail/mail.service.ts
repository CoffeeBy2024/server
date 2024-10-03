import { Injectable } from '@nestjs/common';
import { EmailVerificationDto } from './dto';
import { SendgridService } from './sendgrid/sendgrid.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly sendgridService: SendgridService,
    private readonly configService: ConfigService
  ) {}

  async verifyEmail(dto: EmailVerificationDto) {
    const emailVerificationLink = `${this.configService.get('API_URI')}/user/verify-email/${dto.emailVerificationLink}`;

    const html = `
      <div>
        <h1>For email verification click on button</h1>
        <button>
          <a href=${emailVerificationLink}>Verify email!</a>
        </button>
      </div>
    `;

    const mail = {
      to: dto.email,
      subject: 'Verify your email on CoffeeBy',
      from: {
        name: 'CoffeeBy',
        email: this.configService.get('SENDGRID_EMAIL_FROM'),
      },
      html: html,
    };

    return await this.sendgridService.send(mail);
  }
}
