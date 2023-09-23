import { Container } from 'inversify';
import UsersService from '../services/users.service';
import UsersController from '../controllers/users.controller';
import PrismaConnection from '../services/prisma.connection';
import TasksService from '../services/tasks.service';
import TasksController from '../controllers/tasks.controller';
import CreateTaskMiddleware from '../middlewares/createTask.middleware';
import CreateUserMiddleware from '../middlewares/createUser.middleware';
import AuthorizationMiddleware from '../middlewares/authorization.middleware';
import EnvironmentConnection from '../services/environment.connection';

const container = new Container();

// Controllers
container.bind(UsersController).toSelf()
container.bind(TasksController).toSelf()

// Services
container.bind(UsersService).toSelf()
container.bind(TasksService).toSelf()

// Middlewares
container.bind(CreateTaskMiddleware).toSelf()
container.bind(CreateUserMiddleware).toSelf()
container.bind(AuthorizationMiddleware).toSelf()

// Connections
container.bind(PrismaConnection).toSelf().inSingletonScope()
container.bind(EnvironmentConnection).toSelf().inSingletonScope()

export default container;