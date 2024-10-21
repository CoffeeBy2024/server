import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities';
import { FindOneOptions, Repository } from 'typeorm';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { OptionalWithoutNull } from './types';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordByTokenDto } from './dto/reset-password-by-token.dto';

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

  async createUser(dto: CreateUserDto) {
    const hashedPassword = this.hashPassword(dto.password);
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

    const updatedUser = Object.assign(user, dto);
    return this.userRepository.save(updatedUser);
  }

  async verifyEmail(emailVerificationLink: string) {
    const user = await this.getUserByConditions({ emailVerificationLink });
    if (!user) {
      throw new BadRequestException('Email verification link is not correct');
    }
    user.emailVerified = true;
    user.emailVerificationLink = null;
    return this.userRepository.save(user);
  }

  async confirmPasswordRecoveryVerificationLink(
    passwordRecoveryVerificationLink: string
  ) {
    const user = await this.getUserByConditions({
      passwordRecoveryVerificationLink,
    });
    if (!user) {
      throw new BadRequestException('Email verification link is not correct');
    }
    user.passwordRecoveryVerificationLink = null;
    return this.userRepository.save(user);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { id, passwordRecoveryVerificationLink, password } = dto;
    const user = await this.getUserByConditions({
      id,
      passwordRecoveryVerificationLink,
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const hashedPassword = this.hashPassword(password);

    user.password = hashedPassword;
    return this.userRepository.save(user);
  }

  async resetPasswordByToken(user: any, dto: ResetPasswordByTokenDto) {
    const { password, currentPassword } = dto;

    const isPasswordVerified = this.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordVerified) {
      throw new BadRequestException('Wrong current password');
    }

    const hashedPassword = this.hashPassword(password);
    user.password = hashedPassword;
    return this.userRepository.save(user);
  }

  private hashPassword(password: string | undefined) {
    if (!password) {
      return null;
    }
    return hashSync(password, genSaltSync(5));
  }

  private verifyPassword(password: string, hashedPassword: string) {
    return compareSync(password, hashedPassword);
  }
}
