import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':IdOrEmail')
  getUser(@Param('IdOrEmail') idOrEmail: string) {
    return this.userService.getUser(idOrEmail);
  }

  @Delete(':IdOrEmail')
  deleteUser(@Param('IdOrEmail') IdOrEmail: string) {
    return this.userService.deleteUser(IdOrEmail);
  }

  @Patch(':IdOrEmail')
  updateUser(
    @Body() dto: UpdateUserDto,
    @Param('IdOrEmail') IdOrEmail: string
  ) {
    return this.userService.updateUser(dto, IdOrEmail);
  }
}
