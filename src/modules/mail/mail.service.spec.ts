import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { sendgridMailServiceProvider } from './sendgrid/mocks';
import { SendgridService } from './sendgrid/sendgrid.service';
import { MAIL_DATA, MAIL_ORGANIZATION_NAME } from './constants';
import {
  mockVerifyEmailDto,
  mockCreateHtmlTemplate,
  mockMailOrganizationName,
  mockMailData,
  mockPasswordRecoveryVerificationDto,
} from './mocks/mail.mock';
import { configServiceProvider, mockConfigData } from '@auth/mocks';

describe('MailService', () => {
  let service: MailService;
  let sendGrid: SendgridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        SendgridService,
        sendgridMailServiceProvider,
        configServiceProvider(),
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    sendGrid = module.get<SendgridService>(SendgridService);

    jest.replaceProperty(
      MAIL_ORGANIZATION_NAME,
      'value',
      mockMailOrganizationName.value
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(sendGrid).toBeDefined();
  });

  describe('verifyEmail', () => {
    beforeEach(() => {
      jest.replaceProperty(MAIL_DATA, 'verifyEmail', {
        subject: 'abc',
        title: 'abc',
        btnText: 'abc',
      });
    });
    it('should call send method', async () => {
      const spyMethod = jest.spyOn(sendGrid, 'send');
      await service.verifyEmail(mockVerifyEmailDto);

      const { btnText, subject, title } = mockMailData.verifyEmail;

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        to: mockVerifyEmailDto.email,
        subject,
        from: {
          name: mockMailOrganizationName.value,
          email: mockConfigData.SENDGRID_EMAIL_FROM,
        },
        html: mockCreateHtmlTemplate(
          title,
          btnText,
          `${mockConfigData.API_URL}/user/verify-email/${mockVerifyEmailDto.emailVerificationLink}`
        ),
      });
    });
  });

  describe('verifyPasswordRecovery', () => {
    beforeEach(() => {
      jest.replaceProperty(MAIL_DATA, 'verifyPasswordRecovery', {
        subject: 'abc',
        title: 'abc',
        btnText: 'abc',
      });
    });
    it('should call send method', async () => {
      const spyMethod = jest.spyOn(sendGrid, 'send');
      await service.verifyPasswordRecovery(mockPasswordRecoveryVerificationDto);

      const { btnText, subject, title } = mockMailData.verifyPasswordRecovery;

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        to: mockPasswordRecoveryVerificationDto.email,
        subject,
        from: {
          name: mockMailOrganizationName.value,
          email: mockConfigData.SENDGRID_EMAIL_FROM,
        },
        html: mockCreateHtmlTemplate(
          title,
          btnText,
          `${mockConfigData.API_URL}/user/recover-password/${mockPasswordRecoveryVerificationDto.passwordRecoveryVerificationLink}`
        ),
      });
    });
  });
});
