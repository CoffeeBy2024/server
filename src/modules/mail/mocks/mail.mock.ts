import { MAIL_DATA, MAIL_ORGANIZATION_NAME } from '@mail/constants';
import {
  EmailVerificationDto,
  PasswordRecoveryVerificationDto,
} from '@mail/dto';
import { mockUser } from '@user/mocks';

export const mockVerifyEmailDto: EmailVerificationDto = {
  email: mockUser.email,
  emailVerificationLink: '123123-123',
};

export const mockPasswordRecoveryVerificationDto: PasswordRecoveryVerificationDto =
  {
    email: mockUser.email,
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
