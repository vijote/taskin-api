import { injectable } from 'inversify'
import PrismaConnection from "./prisma.connection";
import { TaskState } from '../enums/taskState.enum';

type CreateTaskOptions = {
    content: string,
    title: string,
    state: TaskState,
    authorId: number
}

type UpdateTaskOptions = Partial<CreateTaskOptions>;

@injectable()
class TasksService {
    private prisma: PrismaConnection;

    constructor(prisma: PrismaConnection) {
        this.prisma = prisma;
    }

    getAll(userId: number) {
        return this.prisma.client.task.findMany({
            where: {
                authorId: userId
            }
        })
    }

    create(data: CreateTaskOptions) {
        return this.prisma.client.task.create({ data })
    }

    update(id: number, data: UpdateTaskOptions) {
        return this.prisma.client.task.update({
            data,
            where: { id, authorId: data.authorId }
        })
    }
}

export default TasksService