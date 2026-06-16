import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';

type AuthUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<AuthUser> {
    const existingUser = await this.usersService.findOne(
      authCredentialsDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = await this.usersService.create({
      username: authCredentialsDto.username,
      password: authCredentialsDto.password,
    });
    const { password, ...result } = user;

    return result;
  }

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
