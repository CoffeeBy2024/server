import { Injectable } from '@nestjs/common';
import { EmailVerificationDto, PasswordRecoveryVerificationDto } from './dto';
import { SendgridService } from './sendgrid/sendgrid.service';
import { ConfigService } from '@nestjs/config';
import { MailDataRequired } from '@sendgrid/mail';
import { MAIL_DATA, MAIL_ORGANIZATION_NAME } from './constants';

@Injectable()
export class MailService {
  constructor(
    private readonly sendgridService: SendgridService,
    private readonly configService: ConfigService
  ) {}

  async verifyEmail(dto: EmailVerificationDto) {
    const subject = MAIL_DATA.verifyEmail.subject;
    const to = dto.email;
    const html = this.getVerifyEmailTemplate(dto.emailVerificationLink);
    const mail = this.getMailData({ to, subject, html });

    return await this.sendgridService.send(mail as MailDataRequired);
  }

  async verifyPasswordRecovery(dto: PasswordRecoveryVerificationDto) {
    const subject = MAIL_DATA.verifyPasswordRecovery.subject;
    const to = dto.email;
    const html = this.getVerifyPasswordRecoveryTemplate(
      dto.passwordRecoveryVerificationLink
    );
    const mail = this.getMailData({ to, subject, html });

    return await this.sendgridService.send(mail as MailDataRequired);
  }

  private getMailData({
    to,
    subject,
    html,
  }: Pick<MailDataRequired, 'to' | 'subject' | 'html'>) {
    return {
      to,
      subject,
      from: {
        name: MAIL_ORGANIZATION_NAME.value,
        email: this.configService.get('SENDGRID_EMAIL_FROM'),
      },
      html,
    };
  }

  private getVerifyEmailTemplate(emailVerificationLink: string) {
    const emailVerificationURL = `${this.configService.get<string>('API_URL')}/user/verify-email/${emailVerificationLink}`;
    const { title, btnText } = MAIL_DATA.verifyEmail;

    return this.createHtmlTemplate(title, btnText, emailVerificationURL);
  }

  private getVerifyPasswordRecoveryTemplate(
    passwordRecoveryVerificationLink: string
  ) {
    const passwordRecoveryVerificationURL = `${this.configService.get('API_URL')}/user/recover-password/${passwordRecoveryVerificationLink}`;
    const { title, btnText } = MAIL_DATA.verifyPasswordRecovery;

    return this.createHtmlTemplate(
      title,
      btnText,
      passwordRecoveryVerificationURL
    );
  }

  private createHtmlTemplate(title: string, btnText: string, url: string) {
    const template = `
  <div>
    <h1>${title}</h1>
    <button>
      <a href="${url}">${btnText}</a>
    </button>
  </div>
    `.trim();
    return template;
  }
}
