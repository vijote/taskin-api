import { injectable } from 'inversify'
import PrismaManager from "../managers/prismaManager";
import { TaskState } from '../enums/taskState.enum';
import { AppException } from '../core/utils';
import Service from './base.service';
import EnvironmentManager from '../managers/environmentManager';
import { ParsedQs } from 'qs';
import EncryptionManager from '../managers/encryptionManager';

type CreateTaskOptions = {
    content: string,
    title: string,
    state: TaskState,
    authorId: number
}

type GetTaskOptions = {
    authorId: number
    id: string
}

type EncodedTask = {
    id: string,
    createdAt: Date,
    title: string,
    content: string,
    state: string
}

@injectable()
class TasksService extends Service {
    constructor(prisma: PrismaManager, env: EnvironmentManager, newCrypto: EncryptionManager) {
        super(prisma, env, newCrypto)
    }

    async getAllGroupedByState(userId: number) {
        const toDoTasksPromise = this.getAllByState(userId, TaskState.TO_DO)
        const inProgressTasksPromise = this.getAllByState(userId, TaskState.IN_PROGRESS)
        const doneTasksPromise = this.getAllByState(userId, TaskState.DONE)

        const [toDo, inProgress, done] = await Promise.all([
            toDoTasksPromise,
            inProgressTasksPromise,
            doneTasksPromise
        ])

        return {
            toDo,
            inProgress,
            done
        }
    }

    async getAll(userId: number, queryParams: ParsedQs) {
        const queryOptions = this.generateQueryOptions(queryParams)

        if (queryParams.isCount) return this.countAll(userId)

        const filteredTasks = await this.prisma.client.task.findMany({
            select: {
                id: true,
                createdAt: true,
                title: true,
                content: true,
                state: true
            },
            orderBy: [
                ...queryOptions.orderBy
            ],
            where: {
                authorId: userId,
                ...queryOptions.where
            }
        })

        const encodedFilteredTasks: EncodedTask[] = filteredTasks.map(task => ({
            ...task,
            id: encodeURIComponent(this.encryptId(task.id))
        }))

        return encodedFilteredTasks
    }

    countAll(userId: number) {
        return this.prisma.client.task.count({
            where: {
                authorId: userId
            }
        })
    }

    generateQueryOptions(queryParams: ParsedQs) {
        const orderByOptions: { [key: string]: 'asc' | 'desc' }[] = []
        const filterOptions: { [key: string]: string | { contains: string } } = {}

        const orderDict = {
            '0': 'desc',
            '1': 'asc'
        }

        const SORT_PREFIX = 'sort-'
        const FILTER_PREFIX = 'filter-'

        for (const key in queryParams) {
            const isOrderProperty = key.includes(SORT_PREFIX)
            const isFilterProperty = key.includes(FILTER_PREFIX)

            if (isOrderProperty) {
                const property = key.replace(SORT_PREFIX, '')
                const value = queryParams[key] as string

                orderByOptions.push({
                    [property]: orderDict[value]
                })
            }

            if (isFilterProperty) {
                const property = key.replace(FILTER_PREFIX, '')
                const value = queryParams[key] as string

                if (property === "title") filterOptions[property] = {
                    contains: value
                }
                else filterOptions[property] = value
            }
        }

        return {
            where: filterOptions,
            orderBy: orderByOptions
        }
    }

    async getAllByState(userId: number, state: TaskState) {
        const filteredTasks = await this.prisma.client.task.findMany({
            select: {
                id: true,
                createdAt: true,
                title: true,
                content: true,
                state: true
            },
            orderBy: {
                createdAt: 'asc'
            },
            where: {
                state,
                authorId: userId
            }
        })

        const encodedFilteredTasks: EncodedTask[] = filteredTasks.map(task => ({
            ...task,
            id: encodeURIComponent(this.encryptId(task.id))
        }))

        return encodedFilteredTasks
    }

    create(data: CreateTaskOptions) {
        return this.prisma.client.task.create({ data, select: { title: true, content: true } })
    }

    async update(encodedId: string, data: Partial<CreateTaskOptions>) {
        const id = this.decryptId(encodedId)
        const updatedTask = await this.prisma.client.task.update({
            data,
            where: { id, authorId: data.authorId }
        })

        if (!updatedTask) throw new AppException("No pudimos actualizar tu tarea", 409)

        return {
            ...updatedTask,
            id: encodeURIComponent(this.encryptId(updatedTask.id))
        }
    }

    async get(data: GetTaskOptions) {
        const id = this.decryptId(data.id)
        const foundTask = await this.prisma.client.task.findFirst({
            where: {
                id,
                authorId: data.authorId
            }
        })

        if (!foundTask) throw new AppException("No pudimos encontrar tu tarea", 404)

        return {
            ...foundTask,
            id: encodeURIComponent(this.encryptId(foundTask.id))
        }
    }

    async delete(data: GetTaskOptions) {
        const id = this.decryptId(data.id)
        const foundTask = await this.prisma.client.task.delete({
            where: {
                id,
                authorId: data.authorId
            }
        })

        if (!foundTask) throw new AppException("No pudimos eliminar tu tarea", 404)

        return foundTask
    }
}

export default TasksService