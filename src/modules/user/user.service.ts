import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities';
import { FindOneOptions, Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { UpdateUserDto } from './dto';
import { OptionalWithoutNull } from './types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async getUserByConditions(
    conditions: OptionalWithoutNull<User>,
    options: Omit<FindOneOptions<User>, 'where'> = {}
  ) {
    return this.userRepository.findOne({
      where: conditions,
      ...options,
    });
  }

  async createUser(dto: Partial<User>) {
    const hashedPassword = dto.password && this.hashPassword(dto.password);
    return this.userRepository.save(
      this.userRepository.create({ ...dto, password: hashedPassword })
    );
  }

  async getAllUsers() {
    return this.userRepository.find();
  }

  async deleteUser(id: number) {
    const user = await this.getUserByConditions({ id });
    if (user) {
      return this.userRepository.remove(user);
    }
    return null;
  }

  async updateUser(dto: UpdateUserDto, id: number) {
    const user = await this.getUserByConditions({ id });
    if (!user) {
      throw new BadRequestException(`Cannot find user with '${id}' id`);
    }

    const hashedPassword = dto.password
      ? this.hashPassword(dto.password)
      : user.password;

    const updatedUser = Object.assign(user, dto, { password: hashedPassword });
    return this.userRepository.save(updatedUser);
  }

  async verifyEmail(emailVerificationLink: string) {
    const user = await this.getUserByConditions({ emailVerificationLink });
    if (!user) {
      throw new BadRequestException('Email verification link is not correct');
    }
    user.emailVerified = true;
    return this.userRepository.save(user);
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(5));
  }
}
