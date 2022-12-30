import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UsersService } from './users.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  async signup(email: string, password: string) {
    const [user] = await this.usersService.findAllWithEmail(email);
    if (user) {
      throw new BadRequestException('email in use!');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const newUser = await this.usersService.create(email, result);

    return newUser;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.findAllWithEmail(email);
    if (!user) {
      throw new BadRequestException('email or password is incorrect!');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('email or password is incorrect!!');
    }

    return user;
  }
}
