import { BaseMiddleware } from "inversify-express-utils";
import { injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'
import { AppException } from "../core/utils";
import UsersService from "../services/users.service";

@injectable()
class AuthorizationMiddleware extends BaseMiddleware {
    private usersService: UsersService

    constructor(usersService: UsersService) {
        super()
        this.usersService = usersService
    }

    public async handler(req: Request, _res: Response, next: NextFunction) {
        const userId = req.header("user-id")

        if (!userId) return next(new AppException('Unauthorized', 401))

        const user = await this.usersService.getUser(userId)

        // Save authenticated user's id
        req.taskin = {
            userId: user.id
        }

        next();
    }
}

export default AuthorizationMiddleware