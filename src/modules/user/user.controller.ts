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
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserDto,
  ResetPasswordByRecoverLinkDto,
  ResetPasswordByTokenDto,
} from './dto';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';
import { NoCache, Public, User } from '@common/decorators';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { TTLVariables } from 'src/utils/constants/cache';
import { invalidateCache } from '@common/utils';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RequestUser } from '@auth/types';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('user')
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
  @ApiCreatedResponse({ type: UserResponseDto, description: 'User object' })
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return new UserResponseDto(user);
  }

  @Get('/all')
  @ApiOkResponse({
    type: [UserResponseDto],
    description: 'Array of user objects',
  })
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    return plainToInstance(UserResponseDto, users);
  }

  @Get('/by-token')
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(UserResponseDto) }, { type: 'null' }],
    },
    description: 'User object or null',
  })
  async getUserByToken(@User() requestUser: RequestUser) {
    const { id } = requestUser;
    return this.getUser(id);
  }

  @Get(':id')
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(UserResponseDto) }, { type: 'null' }],
    },
    description: 'User object or null',
  })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.getUser(id);
  }

  @Delete(':id')
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(UserResponseDto) }, { type: 'null' }],
    },
    description: 'User object or null',
  })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.invalidateUserCache(id);
    const user = await this.userService.deleteUser(id);
    if (user) {
      return new UserResponseDto(user);
    }
    return null;
  }

  @Patch('/by-token')
  @ApiOkResponse({ type: UserResponseDto, description: 'User object' })
  async updateUserByToken(
    @User() requestUser: RequestUser,
    @Body() dto: UpdateUserDto
  ) {
    const { id } = requestUser;

    return this.updateUser(dto, id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserResponseDto, description: 'User object' })
  async updateUserById(
    @Body() dto: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.updateUser(dto, id);
  }

  @Public()
  @Get('verify-email/:emailVerificationLink')
  @ApiResponse({
    status: 302,
    description: 'Redirection to the client URL or profile page',
    headers: {
      Location: {
        description: 'The URL to which the user is being redirected',
        schema: {
          type: 'string',
          oneOf: [
            { example: 'https://example-client.com' },
            { example: 'https://example-client.com/profile' },
          ],
        },
      },
    },
  })
  async verifyEmail(
    @Param('emailVerificationLink') emailVerificationLink: string,
    @Res() res: Response
  ) {
    let redirectURI;
    try {
      const user = await this.userService.verifyEmail(emailVerificationLink);
      await this.invalidateUserCache(user.id);
      redirectURI = `${this.configService.getOrThrow<string>('CLIENT_URL')}/profile`;
    } catch (e) {
      redirectURI = `${this.configService.getOrThrow<string>('CLIENT_URL')}`;
    }
    res.redirect(redirectURI);
  }

  @Public()
  @Get('recover-password/:passwordRecoveryVerificationLink')
  @ApiResponse({
    status: 302,
    description: 'Redirection to the client URL or reset password page',
    headers: {
      Location: {
        description: 'The URL to which the user is being redirected',
        schema: {
          type: 'string',
          oneOf: [
            { example: 'https://example-client.com' },
            {
              example:
                'https://example-client.com/reset-password?passwordRecoveryVerificationLink=passwordRecoveryVerificationLink&id=id',
            },
          ],
        },
      },
    },
  })
  async recoverPassword(
    @Param('passwordRecoveryVerificationLink')
    passwordRecoveryVerificationLink: string,
    @Res() res: Response
  ) {
    let redirectURI;
    try {
      const user =
        await this.userService.confirmPasswordRecoveryVerificationLink(
          passwordRecoveryVerificationLink
        );
      await this.invalidateUserCache(user.id);
      redirectURI = `${this.configService.getOrThrow<string>('CLIENT_URL')}/reset-password?passwordRecoveryVerificationLink=${passwordRecoveryVerificationLink}&id=${user.id}`;
    } catch (e) {
      redirectURI = `${this.configService.getOrThrow<string>('CLIENT_URL')}`;
    }
    res.redirect(redirectURI);
  }

  @Public()
  @Post('reset-password')
  @ApiResponse({
    status: 201,
    description: 'Password reset success',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset success' },
      },
    },
  })
  async resetPasswordByRecoverLink(@Body() dto: ResetPasswordByRecoverLinkDto) {
    const user = await this.userService.resetPasswordByRecoverLink(dto);
    await this.invalidateUserCache(user.id);
    return {
      message: 'Password reset success',
    };
  }

  @Post('profile/reset-password')
  @ApiResponse({
    status: 201,
    description: 'Password reset success',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset success' },
      },
    },
  })
  async resetPasswordByToken(
    @User() requestUser: RequestUser,
    @Body() dto: ResetPasswordByTokenDto
  ) {
    const user = await this.userService.resetPasswordByToken(requestUser, dto);
    await this.invalidateUserCache(user.id);
    return {
      message: 'Password reset success',
    };
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
}
