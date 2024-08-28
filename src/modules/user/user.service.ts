import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GoogleAuthUserDto } from '../auth/dto/google-auth-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async getUser(idOrEmail: string) {
    return this.userRepository.findOne({
      where: [{ id: Number(idOrEmail) || 0 }, { email: idOrEmail }],
      relations: {
        tokens: true,
      },
    });
  }

  async createUser(dto: CreateUserDto | GoogleAuthUserDto) {
    if ('password' in dto) {
      const hashedPassword = this.hashPassword(dto.password);
      return this.userRepository.save({ ...dto, password: hashedPassword });
    }
    return this.userRepository.save({ ...dto });
  }

  async getAllUsers() {
    return this.userRepository.find();
  }

  async deleteUser(IdOrEmail: string) {
    const user = await this.getUser(IdOrEmail);
    if (user) {
      return this.userRepository.remove(user);
    }
  }

  async updateUser(dto: UpdateUserDto, IdOrEmail: string) {
    const user = await this.getUser(IdOrEmail);
    if (!user) {
      throw new BadRequestException(
        `Cannot find user with '${IdOrEmail}' id or email`
      );
    }

    const hashedPassword = dto.password
      ? this.hashPassword(dto.password)
      : user.password;

    const updatedUser = Object.assign(user, dto, { password: hashedPassword });
    return this.userRepository.save(updatedUser);
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(5));
  }
}
