import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { sendgridMailServiceProvider } from './sendgrid/mocks';
import { ConfigService } from '@nestjs/config';
import { SendgridService } from './sendgrid/sendgrid.service';
import { EmailVerificationDto } from './dto';

const mockEmailVerificationDto: EmailVerificationDto = {
  email: '123',
  emailVerificationLink: '123123123',
};

describe('MailService', () => {
  let service: MailService;
  let sendGrid: SendgridService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        SendgridService,
        sendgridMailServiceProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    sendGrid = module.get<SendgridService>(SendgridService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(sendGrid).toBeDefined();
  });

  describe('verifyEmail', () => {
    it('should call send method', async () => {
      const spyMethod = jest.spyOn(sendGrid, 'send');

      await service.verifyEmail(mockEmailVerificationDto);

      expect(spyMethod).toHaveBeenCalledTimes(1);
    });
  });
});
