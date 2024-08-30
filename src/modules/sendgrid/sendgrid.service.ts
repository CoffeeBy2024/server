import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  MailService as SendGridMailService,
  ClientResponse,
  MailDataRequired,
} from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(private readonly sendGridMailService: SendGridMailService) {}

  async send(
    mail: MailDataRequired
  ): Promise<[ClientResponse, Record<any, any>]> {
    try {
      const response = await this.sendGridMailService.send(mail);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
