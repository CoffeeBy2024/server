import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientResponse, MailDataRequired, MailService } from '@sendgrid/mail';

@Injectable()
export class SendgridService {
  constructor(private readonly mailService: MailService) {}

  async send(
    mail: MailDataRequired
  ): Promise<[ClientResponse, Record<any, any>]> {
    try {
      const response = await this.mailService.send(mail);
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
