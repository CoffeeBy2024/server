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
import { invalidateCache } from '@common/utils';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordByTokenDto } from './dto/reset-password-by-token.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@NoCache()
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService
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
  async getUserByToken(@User() requestUser: any) {
    const { id } = requestUser;
    return this.getUser(id);
  }

  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.getUser(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.invalidateUserCache(id);
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

    return this.updateUser(dto, id);
  }

  @Patch(':id')
  async updateUserById(
    @Body() dto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.updateUser(dto, id);
  }

  @Public()
  @Get('verify-email/:emailVerificationLink')
  async verifyEmail(
    @Param('emailVerificationLink') emailVerificationLink: string
  ) {
    const user = await this.userService.verifyEmail(emailVerificationLink);
    return new UserResponseDto(user);
  }

  private async getUser(id: number) {
    const cachedUser = await this.getCachedUser(id);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userService.getUserByConditions({ id });

    if (!user) {
      return null;
    }

    const userResponse = new UserResponseDto(user);
    await this.setUserToCache(id, userResponse);
    return userResponse;
  }

  private async updateUser(dto: UpdateUserDto, id: number) {
    await this.invalidateUserCache(id);

    const user = await this.userService.updateUser(dto, id);
    return new UserResponseDto(user);
  }

  private getUserCacheKey(id: number) {
    return `user_by_token_${id}`;
  }

  private async invalidateUserCache(id: number) {
    const cacheKey = this.getUserCacheKey(id);
    await invalidateCache(this.cacheManager, cacheKey);
  }

  private async getCachedUser(id: number) {
    const cacheKey = this.getUserCacheKey(id);
    const cachedUser = await this.cacheManager.get(cacheKey);
    return cachedUser || null;
  }

  private async setUserToCache(id: number, user: UserResponseDto) {
    const cacheKey = this.getUserCacheKey(id);
    await this.cacheManager.set(cacheKey, user, TTLVariables.common);
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
    await this.invalidateUserCache(user.id);
    const redirectURI = `${this.configService.getOrThrow('CLIENT_URL')}/reset-password?passwordRecoveryVerificationLink=${passwordRecoveryVerificationLink}&id=${user.id}`;
    res.redirect(redirectURI);
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
