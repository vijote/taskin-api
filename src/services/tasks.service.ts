import { injectable } from 'inversify'
import PrismaConnection from "./prisma.connection";
import { TaskState } from '../enums/taskState.enum';
import { AppException } from '../core/utils';
import Service from './base.service';
import EnvironmentConnection from './environment.connection';

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
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    content: string;
    state: string
    authorId: number;
}

@injectable()
class TasksService extends Service {

    constructor(prisma: PrismaConnection, env: EnvironmentConnection) {
        super(prisma, env)
    }

    async getAll(userId: number) {
        const toDoTasksPromise = this.prisma.client.task.findMany({
            where: {
                state: TaskState.TO_DO,
                authorId: userId
            }
        });

        const inProgressTasksPromise = this.prisma.client.task.findMany({
            where: {
                state: TaskState.IN_PROGRESS,
                authorId: userId
            }
        });

        const doneTasksPromise = this.prisma.client.task.findMany({
            where: {
                state: TaskState.DONE,
                authorId: userId
            }
        });

        const [toDoTasks, inProgressTasks, doneTasks] = await Promise.all([
            toDoTasksPromise,
            inProgressTasksPromise,
            doneTasksPromise
        ])

        const encodedTodoTasks: EncodedTask[] = toDoTasks.map(task => ({
            ...task,
            id: encodeURIComponent(this.encryptId(task.id))
        }))
        const encodedInProgressTasks: EncodedTask[] = inProgressTasks.map(task => ({
            ...task,
            id: encodeURIComponent(this.encryptId(task.id))
        }))
        const encodedDoneTasks: EncodedTask[] = doneTasks.map(task => ({
            ...task,
            id: encodeURIComponent(this.encryptId(task.id))
        }))

        return {
            toDo: encodedTodoTasks,
            inProgress: encodedInProgressTasks,
            done: encodedDoneTasks,
            total: toDoTasks.length + inProgressTasks.length + doneTasks.length
        }
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

        return foundTask
    }
}

export default TasksService