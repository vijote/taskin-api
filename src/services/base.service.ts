import { injectable } from 'inversify'
import PrismaManager from '../managers/prismaManager';
import EnvironmentManager from '../managers/environmentManager';
import EncryptionManager from '../managers/encryptionManager';

@injectable()
class Service {
    protected prisma: PrismaManager;
    protected environmentManager: EnvironmentManager;
    private crypto: EncryptionManager

    constructor(prisma: PrismaManager, env: EnvironmentManager, newCrypto: EncryptionManager) {
        this.prisma = prisma;
        this.environmentManager = env;
        this.crypto = newCrypto
    }

    /**
     * Encrypts user id
     * @param id user id
     * @returns base64 encoded string
     */
    public encryptId(id: number) {
        const iv = Buffer.from(this.environmentManager.env('ENCRYPTION_IV'), 'utf8');
        const key = Buffer.from(this.environmentManager.env('ENCRYPTION_KEY').substring(0, 32), 'utf8');

        const cipher = this.crypto.createCipheriv(this.environmentManager.env('ENCRYPTION_ALGORITHM'), key, iv);

        const encrypted = cipher.update(id.toString(), 'utf-8', 'base64') + cipher.final('base64');

        return encrypted;
    }

    /**
     * Decrypts encoded user id
     * @param id base64 enconded string
     * @returns decoded user id
     */
    public decryptId(id: string): number {
        const iv = Buffer.from(this.environmentManager.env('ENCRYPTION_IV'), 'utf8');
        const key = Buffer.from(this.environmentManager.env('ENCRYPTION_KEY').substring(0, 32), 'utf8');

        const decipher = this.crypto.createDecipheriv(this.environmentManager.env('ENCRYPTION_ALGORITHM'), key, iv);

        const decrypted = decipher.update(decodeURIComponent(id), 'base64', 'utf8') + decipher.final('utf8');

        return Number(decrypted);
    }
}

export default Service