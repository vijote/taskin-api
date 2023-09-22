import { Container } from 'inversify';
import UsersService from '../services/users.service';
import UsersController from '../controllers/users.controller';
import PrismaConnection from '../services/prisma.connection';

const container = new Container();

container.bind(UsersController).toSelf()
container.bind(PrismaConnection).toSelf().inSingletonScope()
container.bind(UsersService).toSelf()

export default container;