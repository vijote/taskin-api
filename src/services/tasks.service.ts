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
        const orderByOptions = []

        const orderDict = {
            '0': 'desc',
            '1': 'asc'
        }

        for (const key in queryParams) {
            const isOrderByProperty = key.includes('sort')
            const test = queryParams[key] as string
            const property = key.replace('sort-', '')

            if (isOrderByProperty) orderByOptions.push({
                [property]: orderDict[test]
            })
        }

        console.log(orderByOptions);


        const filteredTasks = await this.prisma.client.task.findMany({
            select: {
                id: true,
                createdAt: true,
                title: true,
                content: true,
                state: true
            },
            orderBy: [
                ...orderByOptions
            ],
            where: {
                authorId: userId
            }
        })

        const encodedFilteredTasks: EncodedTask[] = filteredTasks.map(task => ({
            ...task,
            id: encodeURIComponent(this.encryptId(task.id))
        }))

        return encodedFilteredTasks
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
                createdAt: 'desc'
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
        console.log("getAllByTitle", title);

        const filteredTasks = await this.prisma.client.task.findMany({
            select: {
                id: true,
                createdAt: true,
                title: true,
                content: true,
                state: true
            },
            orderBy: {
                createdAt: 'desc'
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