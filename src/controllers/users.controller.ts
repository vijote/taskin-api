import { NextFunction, Request, Response } from "express";
import UsersService from "../services/users.service";
import { BaseHttpController, controller, httpGet, httpPost } from "inversify-express-utils";
import CreateUserMiddleware from "../middlewares/createUser.middleware";

@controller('/users')
class UsersController extends BaseHttpController {
    private usersService: UsersService

    constructor(usersService: UsersService) {
        super()
        this.usersService = usersService
    }

    /**
     * Registers a new user
     */
    @httpPost('/', CreateUserMiddleware)
    async create(req: Request) {
        const { body } = req;
        const encryptedId = await this.usersService.create(body?.name);

        return this.json({
            message: "user created correctly", data: {
                id: encryptedId
            }
        }, 201)
    }
}

export default UsersController;