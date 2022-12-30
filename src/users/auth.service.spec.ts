import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      findAllWithEmail: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        };
        users.push(user);
        return Promise.resolve(user);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@test.com', '1234');

    expect(user.password).not.toEqual('1234');

    const [salt, hash] = user.password.split('.');

    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if signin is called with an unused email', async () => {
    await service.signup('asdf@test.com', '1234');
    try {
      await service.signup('asdf@test.com', '1234');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asdf@test.com', '1234');
    try {
      await service.signin('asdf@test.com', '123456');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('return a user if correct password is provided', async () => {
    await service.signup('asdf@test.com', '1234');
    const user = await service.signin('asdf@test.com', '1234');
    expect(user).toBeDefined();
  });
});
