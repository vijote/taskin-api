import { controller, BaseHttpController, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils'
import TasksService from '../services/tasks.service';
import CreateTaskMiddleware from '../middlewares/createTask.middleware';
import AuthorizationMiddleware, { AuthenticatedRequest } from '../middlewares/authorization.middleware';
import { TaskState } from '../enums/taskState.enum';

@controller('/tasks', AuthorizationMiddleware)
class TasksController extends BaseHttpController {
    private tasksService: TasksService

    constructor(tasksService: TasksService) {
        super()
        this.tasksService = tasksService
    }

    /**
     * Retrieves all tasks without applying any filter
     */
    @httpGet('/')
    async getAll(req: AuthenticatedRequest) {
        const result = await this.tasksService.getAll(req.taskin.userId, req.query);
        return this.json({ message: `tasks found`, data: result }, 200)
    }

    /**
     * Retrieves all tasks grouped by state
     */
    @httpGet('/grouped-by-state')
    async getAllGroupedByState(req: AuthenticatedRequest) {
        const result = await this.tasksService.getAllGroupedByState(req.taskin.userId);
        return this.json({ message: `tasks found`, data: result }, 200)
    }

    /**
     * Creates a new task
     */
    @httpPost('/', CreateTaskMiddleware)
    async create(req: AuthenticatedRequest) {
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
    async update(req: AuthenticatedRequest) {        
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
    async get(req: AuthenticatedRequest) {
        const result = await this.tasksService.get({
            authorId: req.taskin.userId,
            id: req.params.id
        });

        return this.json({ message: `task found`, data: result }, 200)
    }

    /**
     * Deletes a specific task
     */
    @httpDelete('/:id')
    async delete(req: AuthenticatedRequest) {
        const result = await this.tasksService.delete({
            authorId: req.taskin.userId,
            id: req.params.id
        });

        return this.json({ message: `task found`, data: result }, 200)
    }
}

export default TasksController