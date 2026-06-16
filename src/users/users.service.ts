import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const userData = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(userData);
  }

  findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }
}
