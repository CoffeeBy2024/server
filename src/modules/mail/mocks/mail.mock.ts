import { MAIL_DATA, MAIL_ORGANIZATION_NAME } from '@mail/constants';
import {
  EmailVerificationDto,
  PasswordRecoveryVerificationDto,
} from '@mail/dto';

export const mockVerifyEmailDto: EmailVerificationDto = {
  email: '123',
  emailVerificationLink: '123123-123',
};

export const mockPasswordRecoveryVerificationDto: PasswordRecoveryVerificationDto =
  {
    email: '123',
    passwordRecoveryVerificationLink: '123123-123',
  };
export const mockMailOrganizationName: typeof MAIL_ORGANIZATION_NAME = {
  value: 'ABC',
};
export const mockMailData: typeof MAIL_DATA = {
  verifyEmail: {
    subject: 'abc',
    title: 'abc',
    btnText: 'abc',
  },
  verifyPasswordRecovery: {
    subject: 'abc',
    title: 'abc',
    btnText: 'abc',
  },
};

export const mockCreateHtmlTemplate = (
  title: string,
  btnText: string,
  url: string
) => {
  const template = `
  <div>
    <h1>${title}</h1>
    <button>
      <a href="${url}">${btnText}</a>
    </button>
  </div>
  `.trim();
  return template;
};
