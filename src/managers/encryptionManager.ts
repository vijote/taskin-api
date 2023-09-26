import { injectable } from 'inversify'
import { Cipher, Decipher } from 'node:crypto';

@injectable()
abstract class EncryptionManager {
    createCipheriv: (algorithm: string, key: Buffer, initVector: Buffer) => Cipher
    createDecipheriv: (algorithm: string, key: Buffer, initVector: Buffer) => Decipher
}

export default EncryptionManager