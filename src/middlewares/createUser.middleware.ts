import { BaseMiddleware } from "inversify-express-utils";
import { injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'
import { AppException, isString } from "../core/utils";

@injectable()
class CreateUserMiddleware extends BaseMiddleware {
    public handler(req: Request, _res: Response, next: NextFunction) {
        console.log(req.body);
        
        if (isString(req?.body?.name))
            throw new AppException('El nombre es requerido', 409)

        next();
    }
}

export default CreateUserMiddleware