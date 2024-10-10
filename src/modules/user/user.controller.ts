import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto, UserResponseDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';
import { plainToInstance } from 'class-transformer';
import { Public, User } from '@common/decorators';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    const user = await this.userService.getUserByConditions({ id });
    if (user) {
      return new UserResponseDto(user);
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
}
