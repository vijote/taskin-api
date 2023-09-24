import { injectable } from 'inversify'
import PrismaConnection from "./prisma.connection";
import { AppException } from '../core/utils';
import EnvironmentConnection from './environment.connection';
import Service from './base.service';

@injectable()
class UsersService extends Service {

    constructor(prisma: PrismaConnection, env: EnvironmentConnection) {
        super(prisma, env)
    }

    async getUser(encodedId: string) {
        const id = Number(this.decryptId(encodedId))
         
        const foundUser = await this.prisma.client.user.findFirst({
            where: {
                id
            }
        })

        if(!foundUser) throw new AppException("No se ha encontrado el usuario", 404)

        return foundUser
    }

    async create(name: string) {
        const repeatedUser = await this.prisma.client.user.findFirst({
            where: {
                name
            }
        })

        if(repeatedUser) throw new AppException("El usuario ya se encuentra registrado", 409)
        
        const createdUser = await this.prisma.client.user.create({ data: { name } })

        return this.encryptId(createdUser.id);
    }
}

export default UsersService;