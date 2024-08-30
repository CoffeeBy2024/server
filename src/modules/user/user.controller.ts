import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    return new UserResponseDto(user);
  }

  @Get()
  getAllUsers() {
    return plainToInstance(UserResponseDto, this.userService.getAllUsers());
  }

  @Get(':IdOrEmail')
  async getUser(@Param('IdOrEmail') idOrEmail: string) {
    const user = await this.userService.getUser(idOrEmail);
    if (user) {
      return new UserResponseDto(user);
    }
    return null;
  }

  @Delete(':IdOrEmail')
  async deleteUser(@Param('IdOrEmail') IdOrEmail: string) {
    const user = await this.userService.deleteUser(IdOrEmail);
    if (user) {
      return new UserResponseDto(user);
    }
    return null;
  }

  @Patch(':IdOrEmail')
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Param('IdOrEmail') IdOrEmail: string
  ) {
    const user = await this.userService.updateUser(dto, IdOrEmail);
    return new UserResponseDto(user);
  }

  @Public()
  @Get('verify-email/:emailVerificationLink')
  verify(@Param('emailVerificationLink') emailVerificationLink: string) {
    return this.userService.verifyEmail(emailVerificationLink);
  }
}
