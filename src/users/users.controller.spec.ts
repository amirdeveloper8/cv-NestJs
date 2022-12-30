import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'password',
        });
      },
      findAllWithEmail: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: 'password' }]);
      },
    };
    fakeAuthService = {
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password });
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAll('test@email.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@email.com');
  });

  it('find User returns a single user with the given id', async () => {
    const user = await controller.findOne('1');
    expect(user).toBeDefined();
  });

  it('find User throw an error if user with the given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    try {
      await controller.findOne('1');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: null };
    const user = await controller.signin(
      { email: 'test@test.com', password: 'password' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
