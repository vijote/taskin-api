import { injectable } from 'inversify'
import PrismaManager from "../managers/prismaManager";
import { AppException } from '../core/utils';
import EnvironmentManager from '../managers/environmentManager';
import Service from './base.service';
import EncryptionManager from '../managers/encryptionManager';

@injectable()
class UsersService extends Service {
    constructor(prisma: PrismaManager, env: EnvironmentManager, newCrypto: EncryptionManager) {
        super(prisma, env, newCrypto)
    }

    async getUser(encodedId: string) {
        const id = Number(this.decryptId(encodedId))

        const foundUser = await this.prisma.client.user.findFirst({
            where: {
                id
            }
        })

        if (!foundUser) throw new AppException("No se ha encontrado el usuario", 404)

        return foundUser
    }

    async login(name: string) {
        const existingUser = await this.prisma.client.user.findFirst({
            select: { id: true },
            where: { name }
        })

        if (existingUser) return this.encryptId(existingUser.id)

        const newUser = await this.prisma.client.user.create({ data: { name } })

        return this.encryptId(newUser.id);
    }
}

export default UsersService;