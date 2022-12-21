import { Injectable, Logger } from '@nestjs/common';
import { UserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(reqUser: UserDto): Promise<User> {
    this.logger.log(`Creating user user ${reqUser.username}`);
    const user = new User(reqUser);

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findByUsername(username: string): Promise<User> {
    this.logger.log(`Find user ${username}`);
    return this.usersRepository.findOne({ where: { username: username } });
  }
}
