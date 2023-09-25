import { Request } from "express";
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
     * Finds or creates a new user
     */
    @httpPost('/', CreateUserMiddleware)
    async login(req: Request) {
        const encryptedId = await this.usersService.login(req?.body?.name as string);

        return this.json({
            message: "user created correctly", data: {
                id: encryptedId
            }
        }, 201)
    }
}

export default UsersController;