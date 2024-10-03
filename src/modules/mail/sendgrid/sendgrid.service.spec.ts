import { Test, TestingModule } from '@nestjs/testing';
import { SendgridService } from './sendgrid.service';
import { MailService } from '@sendgrid/mail';
import { InternalServerErrorException } from '@nestjs/common';
import {
  sendgridMailServiceProvider,
  mockMailData,
  mockReturnValue,
} from './mocks';

import type { mockMailServiceType } from './mocks';

describe('SendgridService', () => {
  let service: SendgridService;
  let mailService: mockMailServiceType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendgridService, sendgridMailServiceProvider],
    }).compile();

    service = module.get<SendgridService>(SendgridService);
    mailService = module.get<mockMailServiceType>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mailService).toBeDefined();
  });

  describe('send', () => {
    describe('positive', () => {
      it('should call send method', async () => {
        await service.send(mockMailData);

        expect(mailService.send).toHaveBeenCalledTimes(1);
        expect(mailService.send).toHaveBeenCalledWith(mockMailData);
      });

      it('should return response', async () => {
        const result = await service.send(mockMailData);

        expect(result).toEqual(mockReturnValue);
      });
    });

    describe('negative', () => {
      it('should throw InternalServerErrorException with particular message', async () => {
        const errorMessage = 'err msg';
        mailService.send?.mockRejectedValue(new Error(errorMessage));

        try {
          await service.send(mockMailData);
        } catch (err) {
          expect(err).toBeInstanceOf(InternalServerErrorException);
          expect(err.message).toBe(errorMessage);
        }
      });
    });
  });
});
