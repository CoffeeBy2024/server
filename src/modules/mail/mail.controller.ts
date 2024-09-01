import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailVerificationDto } from './dto';
import { Public } from '@common/decorators';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() dto: EmailVerificationDto) {
    return this.mailService.verifyEmail(dto);
  }
}
