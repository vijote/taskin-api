import 'reflect-metadata';
import TasksService from './tasks.service';
import PrismaManager from '../managers/prismaManager';
import { prismaMock } from '../prisma.mock';
import { TaskState } from '../enums/taskState.enum';
import { Cipher, Decipher } from 'crypto';
import { AppException } from '../core/utils';

describe('TasksService', () => {
    const prismaManager = new PrismaManager(prismaMock);
    const mockEnvironmentManager = {
        variables: {},
        env: (_key: string) => "mocked"
    };

    const mockedCipher = {
        update: jest.fn(() => "update"),
        final: jest.fn(() => "final")
    } as unknown as Cipher

    const mockedDecipher = {
        update: jest.fn(() => "update"),
        final: jest.fn(() => "final")
    } as unknown as Decipher

    const mockEncryptionManager = {
        createCipheriv: jest.fn(() => mockedCipher),
        createDecipheriv: jest.fn(() => mockedDecipher)
    };

    let tasksService: TasksService;
    let getAllByStateSpy: jest.SpyInstance;
    let generateQueryOptionsSpy: jest.SpyInstance;

    function mockGetAllByState() {
        getAllByStateSpy = jest.spyOn(tasksService, 'getAllByState');
    }

    function restoreGetAllByState() {
        getAllByStateSpy.mockRestore()
    }

    function mockGenerateQueryOptions() {
        generateQueryOptionsSpy = jest.spyOn(tasksService, 'generateQueryOptions');
    }

    beforeAll(() => {
        tasksService = new TasksService(prismaManager, mockEnvironmentManager, mockEncryptionManager);
    });

    beforeEach(() => {
        mockGetAllByState();
        mockGenerateQueryOptions();
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllGroupedByState', () => {
        it('should call getAllByState with correct parameters', async () => {
            const userId = 1;

            getAllByStateSpy.mockImplementation(() => {
                return Promise.resolve([]);
            });

            await tasksService.getAllGroupedByState(userId);

            expect(getAllByStateSpy).toHaveBeenCalledWith(userId, TaskState.TO_DO);
            expect(getAllByStateSpy).toHaveBeenCalledWith(userId, TaskState.IN_PROGRESS);
            expect(getAllByStateSpy).toHaveBeenCalledWith(userId, TaskState.DONE);
        });
    });

    describe('getAll', () => {
        it('should call generateQueryOptions', async () => {
            const userId = 1;

            prismaMock.task.findMany.mockResolvedValue([])
            await tasksService.getAll(userId, { 'filter-test': 'true', 'sort-test': 'true' });

            expect(generateQueryOptionsSpy).toHaveBeenCalledWith({ 'filter-test': 'true', 'sort-test': 'true' });
        });

        it('should call this.countAll if is count', async () => {
            const userId = 1;

            await tasksService.getAll(userId, { isCount: 'true' });

            expect(prismaMock.task.count).toHaveBeenCalledWith({
                where: {
                    authorId: userId
                }
            });
        });

        it("should call task.findMany if it's not count", async () => {
            const userId = 1;

            prismaMock.task.findMany.mockResolvedValue([])
            await tasksService.getAll(userId, {});

            expect(prismaMock.task.findMany).toHaveBeenCalled();
        });
    });

    describe('countAll', () => {
        it('should call task.count', async () => {
            const userId = 1;

            await tasksService.countAll(userId);

            expect(prismaMock.task.count).toHaveBeenCalledWith({
                where: {
                    authorId: userId
                }
            });
        });
    });

    describe('generateQueryOptions', () => {
        it('should generate orderBy and where options', () => {
            const queryParams = {
                'sort-field': '0',
                'filter-title': 'example',
                'filter-category': 'work',
            };

            const result = tasksService.generateQueryOptions(queryParams);

            // Ensure orderBy options are generated correctly
            expect(result.orderBy).toEqual([{ 'field': 'desc' }]);

            // Ensure where options are generated correctly
            expect(result.where).toEqual({
                'title': { contains: 'example' },
                'category': 'work',
            });
        });

        it('should not add options', () => {
            const queryParams = {};

            const result = tasksService.generateQueryOptions(queryParams);

            // Ensure orderBy options are empty
            expect(result.orderBy).toEqual([]);

            // Ensure where options are empty
            expect(result.where).toEqual({});
        });

        it('should generate orderBy options', () => {
            const queryParams = {
                'sort-field': '1',
            };

            const result = tasksService.generateQueryOptions(queryParams);

            // Ensure orderBy options are generated correctly
            expect(result.orderBy).toEqual([{ 'field': 'asc' }]);
        });

        it('should generate where options', () => {
            const queryParams = {
                'filter-title': 'example',
            };

            const result = tasksService.generateQueryOptions(queryParams);

            // Ensure where options are generated correctly
            expect(result.where).toEqual({
                'title': { contains: 'example' },
            });
        });
    });

    describe('getAllByState', () => {
        it("should call task.findMany", async () => {
            restoreGetAllByState()

            prismaMock.task.findMany.mockResolvedValue([])
            await tasksService.getAllByState(1, TaskState.DONE);

            expect(prismaMock.task.findMany).toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it("should call task.create", async () => {
            restoreGetAllByState()

            const mockedData = { authorId: 1, content: "test", state: TaskState.DONE, title: 'test' }

            await tasksService.create(mockedData);

            expect(prismaMock.task.create).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it("should call decryptId", async () => {
            const mockedData = { id: 1, createdAt: new Date(), updatedAt: new Date(), authorId: 1, content: "test", state: TaskState.DONE, title: 'test' };
            const encodedId = 'encoded-id';

            prismaMock.task.update.mockResolvedValue(mockedData)

            await tasksService.update(encodedId, mockedData);

            expect(mockedDecipher.update).toHaveBeenCalledWith(encodedId, "base64", "utf8");
        });

        it('should throw an error if no task is found', async () => {
            const mockedData = { id: 1, createdAt: new Date(), updatedAt: new Date(), authorId: 1, content: "test", state: TaskState.DONE, title: 'test' };
            const encodedId = 'encoded-id';


            await expect(tasksService.update(encodedId, mockedData)).rejects.toThrow(AppException);
        });
    });

    describe('get', () => {
        it('should call decryptId', async () => {
            const data = { id: 'encoded-id', authorId: 1 };
            const mockedData = { id: 1, createdAt: new Date(), updatedAt: new Date(), authorId: 1, content: "test", state: TaskState.DONE, title: 'test' };

            prismaMock.task.findFirst.mockResolvedValue(mockedData);

            await tasksService.get(data);

            expect(mockedDecipher.update).toHaveBeenCalledWith(data.id, "base64", "utf8");
        });

        it('should return the task if found', async () => {
            const data = { id: 'encoded-id', authorId: 1 };
            const mockedData = { id: 1, createdAt: new Date(), updatedAt: new Date(), authorId: 1, content: "test", state: TaskState.DONE, title: 'test' };

            prismaMock.task.findFirst.mockResolvedValue(mockedData);

            const result = await tasksService.get(data);

            expect(result).toEqual({...mockedData, id: "updatefinal"});
        });

        it('should throw an error if task is not found', async () => {
            const data = { id: 'encoded-id', authorId: 1 };

            prismaMock.task.findFirst.mockResolvedValue(null);

            await expect(tasksService.get(data)).rejects.toThrow(AppException);
        });
    });

    describe('delete', () => {
        it('should call decryptId with the correct argument', async () => {
            const data = { id: 'encoded-id', authorId: 1 };
            const mockedData = { id: 1, createdAt: new Date(), updatedAt: new Date(), authorId: 1, content: "test", state: TaskState.DONE, title: 'test' };

            prismaMock.task.delete.mockResolvedValue(mockedData);

            await tasksService.delete(data);

            expect(mockedDecipher.update).toHaveBeenCalledWith(data.id, "base64", "utf8");
        });

        it('should throw an error if task is not found', async () => {
            const data = { id: 'encoded-id', authorId: 1 };

            await expect(tasksService.delete(data)).rejects.toThrow(AppException);
        });
    });
});
