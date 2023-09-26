import 'reflect-metadata'
import UsersService from './users.service';
import PrismaManager from '../managers/prismaManager';
import EnvironmentManager from '../managers/environmentManager';
import EncryptionManager from '../managers/encryptionManager';
import { prismaMock } from '../prisma.mock';
import { AppException } from '../core/utils';

describe('UsersService', () => {
    const prismaManager = new PrismaManager(prismaMock)

    let usersService: UsersService;
    let decryptIdSpy: jest.SpyInstance
    let encryptIdSpy: jest.SpyInstance

    function mockDecryptId() {
        decryptIdSpy = jest.spyOn(usersService, 'decryptId')
    }
    function mockEncryptId() {
        encryptIdSpy = jest.spyOn(usersService, 'encryptId')
    }

    beforeAll(() => {
        const environmentManager = {} as EnvironmentManager;
        const encryptionManager = {} as EncryptionManager;
        usersService = new UsersService(prismaManager, environmentManager, encryptionManager)
        mockDecryptId()
        mockEncryptId()
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUser', () => {
        it('should call decryptId', async () => {
            const encryptedId = 'encrypted-user-id';
            const decryptedId = 123;

            decryptIdSpy.mockReturnValueOnce(decryptedId);
            prismaMock.user.findFirst.mockResolvedValueOnce({ id: decryptedId, name: 'test' });

            await usersService.getUser(encryptedId);

            expect(usersService.decryptId).toHaveBeenCalledWith(encryptedId);
        });
        it('should call user.findFirst', async () => {
            const encryptedId = 'encrypted-user-id';
            const decryptedId = 123;
            const mockedUser = { id: decryptedId, name: 'John' };

            decryptIdSpy.mockReturnValueOnce(decryptedId);
            prismaMock.user.findFirst.mockResolvedValueOnce(mockedUser);

            const user = await usersService.getUser(encryptedId);

            expect(prismaManager.client.user.findFirst).toHaveBeenCalledWith({
                where: { id: decryptedId },
            });
            expect(user).toEqual(mockedUser);
        });

        it('should throw an error if the user is not found', async () => {
            const encryptedId = 'encrypted-user-id';
            const decryptedId = 123;

            decryptIdSpy.mockReturnValueOnce(decryptedId);
            prismaMock.user.findFirst.mockResolvedValueOnce(null);

            await expect(usersService.getUser(encryptedId)).rejects.toThrow(AppException);
        });
    });

    describe('login', () => {
        it('should return the encoded ID of an existing user', async () => {
            const name = 'test';
            const existingUser = { id: 123, name: 'test' };
            const mockedId = 'encrypted-id'

            prismaMock.user.findFirst.mockResolvedValueOnce(existingUser);
            encryptIdSpy.mockReturnValueOnce(mockedId);

            const result = await usersService.login(name);

            expect(prismaManager.client.user.findFirst).toHaveBeenCalledWith({
                select: { id: true },
                where: { name },
            });
            expect(encryptIdSpy).toHaveBeenCalledWith(existingUser.id);
            expect(result).toEqual(mockedId);
        });

        it('should create a new user and return the encoded ID', async () => {
            const name = 'NewUser';
            const newUser = { id: 456, name: 'NewUser' };
            const mockedId = 'encrypted-id'

            prismaMock.user.findFirst.mockResolvedValueOnce(null);
            prismaMock.user.create.mockResolvedValueOnce(newUser);
            encryptIdSpy.mockReturnValueOnce(mockedId);

            const result = await usersService.login(name);

            expect(prismaManager.client.user.create).toHaveBeenCalledWith({
                data: { name },
            });
            expect(usersService.encryptId).toHaveBeenCalledWith(newUser.id);
            expect(result).toEqual(mockedId);
        });
    });
});
