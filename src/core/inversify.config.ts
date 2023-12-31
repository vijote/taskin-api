import { Container } from 'inversify';
import UsersService from '../services/users.service';
import UsersController from '../controllers/users.controller';
import PrismaManager from '../managers/prismaManager';
import TasksService from '../services/tasks.service';
import TasksController from '../controllers/tasks.controller';
import CreateTaskMiddleware from '../middlewares/createTask.middleware';
import CreateUserMiddleware from '../middlewares/createUser.middleware';
import AuthorizationMiddleware from '../middlewares/authorization.middleware';
import EnvironmentManager from '../managers/environmentManager';
import Service from '../services/base.service';
import crypto from 'node:crypto'
import EncryptionManager from '../managers/encryptionManager';
import { PrismaClient } from '@prisma/client';
import prisma from '../managers/prismaClient'

const container = new Container();

// Controllers
container.bind(UsersController).toSelf()
container.bind(TasksController).toSelf()

// Services
container.bind(Service).toSelf()
container.bind(UsersService).toSelf()
container.bind(TasksService).toSelf()

// Middlewares
container.bind(CreateTaskMiddleware).toSelf()
container.bind(CreateUserMiddleware).toSelf()
container.bind(AuthorizationMiddleware).toSelf()

// Managers
container.bind(PrismaClient).toConstantValue(prisma)
container.bind(EncryptionManager).toConstantValue(crypto);
container.bind(PrismaManager).toSelf().inSingletonScope()
container.bind(EnvironmentManager).toSelf().inSingletonScope()

export default container;