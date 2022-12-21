import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(user: UserDto): Promise<boolean> {
    this.logger.log(`Validating user ${user.username}`);

    const foundUser = await this.usersService.findByUsername(user.username);
    if (!foundUser) {
      this.logger.error(`${user.username} not found`);
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(user.password, foundUser.password);
    if (!isMatch) {
      this.logger.error(`${user.username} found but password didn't match`);
      throw new UnauthorizedException();
    }

    return isMatch;
  }

  async login(user: UserDto) {
    this.logger.log(`Login user ${user.username}`);

    const foundUser = await this.usersService.findByUsername(user.username);
    const payload = { username: user.username, sub: foundUser.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(user: UserDto) {
    this.logger.log(`Register user ${user.username}`);

    const foundUser = await this.usersService.findByUsername(user.username);
    if (foundUser) {
      const message = 'Username is taken';
      this.logger.error(message);
      throw new BadRequestException(message);
    }

    await this.usersService.create(user);

    return { message: 'Successfully registered' };
  }
}
