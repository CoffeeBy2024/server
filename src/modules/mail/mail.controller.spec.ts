import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mail.controller';
import { SendgridService } from './sendgrid/sendgrid.service';
import { sendgridMailServiceProvider, mockReturnValue } from './sendgrid/mocks';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { mockVerifyEmailDto } from './mocks/mail.mock';

describe('MailController', () => {
  let controller: MailController;
  let spyService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
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

    controller = module.get<MailController>(MailController);
    spyService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(spyService).toBeDefined();
  });

  describe('verifyEmail', () => {
    it('should call verifyEmail method', async () => {
      const spyMethod = jest.spyOn(spyService, 'verifyEmail');

      await controller.verifyEmail(mockVerifyEmailDto);

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(mockVerifyEmailDto);
    });

    it('should return sendgrid response object', async () => {
      const result = await controller.verifyEmail(mockVerifyEmailDto);

      expect(result).toEqual(mockReturnValue);
    });
  });
});
