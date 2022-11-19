import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    this.logger.log(`Validating user ${username}`);

    debugger;
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      this.logger.error(`${username} not found`);
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      this.logger.error(`${username} found but password didn't match`);
      throw new UnauthorizedException();
    }

    return isMatch;
  }

  async login(user: UserDto) {
    this.logger.log(`Login user ${user.username}`);

    const foundUser = await this.usersService.findByUsername(user.username);
    const payload = { username: user.username, sub: foundUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
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
