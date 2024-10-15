import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, UserResponseDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';
import { NoCache, Public, User } from '@common/decorators';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TTLVariables } from 'src/utils/constants/cache';
import { getUserCacheKey } from '@common/utils/getUserCacheKey';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordByTokenDto } from './dto/reset-password-by-token.dto';
import { Response } from 'express';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return new UserResponseDto(user);
  }

  @Get('/all')
  async getAllUsers() {
    return plainToInstance(UserResponseDto, this.userService.getAllUsers());
  }

  @Get('/by-token')
  @NoCache()
  async getUserByToken(@User() requestUser: any) {
    const { id } = requestUser;
    const cacheKey = getUserCacheKey(id);

    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userService.getUserByConditions({ id });
    if (user) {
      const userResponse = new UserResponseDto(user);

      await this.cacheManager.set(cacheKey, userResponse, TTLVariables.common);

      return userResponse;
    }
    return null;
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.getUserByConditions({ id });
    if (user) {
      return new UserResponseDto(user);
    }
    return null;
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.deleteUser(id);
    if (user) {
      return new UserResponseDto(user);
    }
    return null;
  }

  @Patch('/by-token')
  async updateUserByToken(
    @User() requestUser: any,
    @Body() dto: UpdateUserDto
  ) {
    const { id } = requestUser;
    const cacheKey = getUserCacheKey(id);

    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      await this.cacheManager.del(cacheKey);
    }

    const user = await this.userService.updateUser(dto, id);

    return new UserResponseDto(user);
  }

  @Patch(':id')
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number
  ) {
    const user = await this.userService.updateUser(dto, id);
    return new UserResponseDto(user);
  }

  @Public()
  @Get('verify-email/:emailVerificationLink')
  async verifyEmail(
    @Param('emailVerificationLink') emailVerificationLink: string
  ) {
    const user = await this.userService.verifyEmail(emailVerificationLink);
    return new UserResponseDto(user);
  }

  @Public()
  @Get('recover-password/:passwordRecoveryVerificationLink')
  async recoverPassword(
    @Param('passwordRecoveryVerificationLink')
    passwordRecoveryVerificationLink: string,
    @Res() res: Response
  ) {
    const user = await this.userService.confirmPasswordRecoveryVerificationLink(
      passwordRecoveryVerificationLink
    );
    const cacheKey = getUserCacheKey(user.id);

    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      await this.cacheManager.del(cacheKey);
    }
    const redirectURI = `http://localhost:3000/reset-password?passwordRecoveryVerificationLink=${passwordRecoveryVerificationLink}&id=${user.id}`;
    res.redirect(redirectURI);
    return redirectURI;
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.userService.resetPassword(dto);
    return {
      message: 'Password reset success',
    };
  }

  @Post('profile/reset-password')
  async resetPasswordByToken(
    @User() requestUser: any,
    @Body() dto: ResetPasswordByTokenDto
  ) {
    await this.userService.resetPasswordByToken(requestUser, dto);
    return {
      message: 'Password reset success',
    };
  }
}
