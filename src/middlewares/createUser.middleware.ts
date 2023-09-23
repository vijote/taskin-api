import { BaseMiddleware } from "inversify-express-utils";
import { injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'
import { AppException, isString } from "../core/utils";

@injectable()
class CreateUserMiddleware extends BaseMiddleware {
    public handler(req: Request, _res: Response, next: NextFunction) {
        if (isString(req?.body?.name))
            throw new AppException('Name is required', 409)

        next();
    }
}

export default CreateUserMiddleware