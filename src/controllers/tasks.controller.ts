import { Request } from 'express';
import { controller, BaseHttpController, httpGet, httpPost, httpPut } from 'inversify-express-utils'
import TasksService from '../services/tasks.service';
import CreateTaskMiddleware from '../middlewares/createTask.middleware';
import AuthorizationMiddleware from '../middlewares/authorization.middleware';
import { TaskState } from '../enums/taskState.enum';

@controller('/tasks', AuthorizationMiddleware)
class TasksController extends BaseHttpController {
    private tasksService: TasksService

    constructor(tasksService: TasksService) {
        super()
        this.tasksService = tasksService
    }

    /**
     * Retrieves all tasks created by the logged user
     */
    @httpGet('/')
    async getAll(req: Request) {
        const result = await this.tasksService.getAll(req.taskin.userId);
        return this.json({ message: `${result.total} tasks found`, data: result }, 200)
    }

    /**
     * Creates a new task
     */
    @httpPost('/', CreateTaskMiddleware)
    async create(req: Request) {
        const result = await this.tasksService.create({
            authorId: req.taskin.userId,
            content: req.body.content,
            state: req.body.state || TaskState.TO_DO,
            title: req.body.title
        });

        return this.json({ message: "task created correctly!", data: result }, 201)
    }

    /**
     * Updates an existing task
     */
    @httpPut('/:id')
    async update(req: Request) {
        const result = await this.tasksService.update(req.params.id, {
            content: req.body.content,
            state: req.body.state,
            title: req.body.title,
            authorId: req.taskin.userId
        });

        return this.json({ message: "task updated correctly!", data: result }, 200)
    }

    /**
     * Retrieves a specific task
     */
    @httpGet('/:id')
    async get(req: Request) {
        const result = await this.tasksService.get({
            authorId: req.taskin.userId,
            id: req.params.id
        });

        return this.json({ message: `task found`, data: result }, 200)
    }
}

export default TasksController