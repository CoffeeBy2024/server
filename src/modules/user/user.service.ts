import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async createUser(dto: Partial<User>) {
    const hashedPassword = dto.password && this.hashPassword(dto.password);
    return this.userRepository.save({ ...dto, password: hashedPassword });
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

  async verifyEmail(emailVerificationLink: string) {
    const user = await this.userRepository.findOneBy({ emailVerificationLink });
    if (!user) {
      throw new BadRequestException('Email verification link is not correct');
    }
    user.emailVerified = true;
    await this.userRepository.save(user);
    return user;
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(5));
  }
}
