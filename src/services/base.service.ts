import { injectable } from 'inversify'
import PrismaConnection from './prisma.connection';
import EnvironmentConnection from './environment.connection';
import crypto from 'node:crypto';

@injectable()
class Service {
    protected prisma: PrismaConnection;
    protected environmentConnector: EnvironmentConnection;

    constructor(prisma: PrismaConnection, env: EnvironmentConnection) {
        this.prisma = prisma;
        this.environmentConnector = env;
    }

    /**
     * Encrypts user id
     * @param id user id
     * @returns base64 encoded string
     */
    protected encryptId(id: number) {
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
    protected decryptId(id: string): number {
        const iv = Buffer.from(this.environmentConnector.env('ENCRYPTION_IV'), 'utf8');
        const key = Buffer.from(this.environmentConnector.env('ENCRYPTION_KEY').substring(0, 32), 'utf8');

        const decipher = crypto.createDecipheriv(this.environmentConnector.env('ENCRYPTION_ALGORITHM'), key, iv);

        const decrypted = decipher.update(id, 'base64', 'utf8') + decipher.final('utf8');

        return Number(decrypted);
    }
}

export default Service