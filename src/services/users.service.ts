import { injectable } from 'inversify'
import PrismaConnection from "./prisma.connection";
import crypto from 'node:crypto';
import { AppException } from '../core/utils';
import EnvironmentConnection from './environment.connection';

@injectable()
class UsersService {
    private prisma: PrismaConnection;
    private environmentConnector: EnvironmentConnection;

    constructor(prisma: PrismaConnection, env: EnvironmentConnection) {
        this.prisma = prisma;
        this.environmentConnector = env;
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

    /**
     * Encrypts user id
     * @param id user id
     * @returns base64 encoded string
     */
    encryptId(id: number) {
        const iv = Buffer.from(this.environmentConnector.env('ENCRYPTION_IV'), 'utf8');
        const key = Buffer.from(this.environmentConnector.env('ENCRYPTION_KEY').substring(0, 32), 'utf8');

        const cipher = crypto.createCipheriv(this.environmentConnector.env('ENCRYPTION_ALGORITHM'), key, iv);

        const encrypted = cipher.update(id.toString(), 'utf-8', 'base64') + cipher.final('base64');

        return encrypted;
    }

    /**
     * Decrypts encoded user id
     * @param id base64 enconded string
     * @returns decoded user id
     */
    decryptId(id: string): number {
        const iv = Buffer.from(this.environmentConnector.env('ENCRYPTION_IV'), 'utf8');
        const key = Buffer.from(this.environmentConnector.env('ENCRYPTION_KEY').substring(0, 32), 'utf8');

        const decipher = crypto.createDecipheriv(this.environmentConnector.env('ENCRYPTION_ALGORITHM'), key, iv);

        const decrypted = decipher.update(id, 'base64', 'utf8') + decipher.final('utf8');

        return Number(decrypted);
    }
}

export default UsersService;