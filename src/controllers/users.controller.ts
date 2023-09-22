import { NextFunction, Request, Response } from "express";
import UsersService from "../services/users.service";
import { controller, httpGet } from "inversify-express-utils";

@controller('/users')
class UsersController {
    private usersService: UsersService

    constructor(usersService: UsersService) {
        this.usersService = usersService
    }

    @httpGet('/')
    async getAll(_req: Request, res: Response, _next: NextFunction) {
        const result = await this.usersService.getAll();
        return res.status(200).send(result)
    }
}

export default UsersController;