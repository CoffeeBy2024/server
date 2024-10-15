import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@user/user.module';
import { httpModuleAsyncOptions, jwtModuleAsyncOptions } from './config';
import { ConfigModule } from '@nestjs/config';
import { STRATEGIES } from './strategies';
import { HttpModule } from '@nestjs/axios';
import { MailModule } from '@mail/mail.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    MailModule,
    ConfigModule,
    JwtModule.registerAsync(jwtModuleAsyncOptions()),
    TypeOrmModule.forFeature([Token]),
    HttpModule.registerAsync(httpModuleAsyncOptions()),
  ],
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES],
})
export class AuthModule {}
