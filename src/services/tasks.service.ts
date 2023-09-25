import { injectable } from 'inversify'
import PrismaConnection from "./prisma.connection";
import { TaskState } from '../enums/taskState.enum';
import { AppException } from '../core/utils';
import Service from './base.service';
import EnvironmentConnection from './environment.connection';
import { ParsedQs } from 'qs';

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

type UpdateTaskOptions = Partial<CreateTaskOptions>;

type EncodedTask = {
    id: string,
    createdAt: Date,
    title: string,
    content: string,
    state: string
}

@injectable()
class TasksService extends Service {

    constructor(prisma: PrismaConnection, env: EnvironmentConnection) {
        super(prisma, env)
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

    private generateQueryOptions(queryParams: ParsedQs) {
        const orderByOptions = []
        const filterOptions = {}

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

    async getAllByTitle(userId: number, title: string) {
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
                title: {
                    contains: title
                },
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
        return this.prisma.client.task.create({ data })
    }

    update(encodedId: string, data: UpdateTaskOptions) {
        const id = this.decryptId(encodedId)
        return this.prisma.client.task.update({
            data,
            where: { id, authorId: data.authorId }
        })
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