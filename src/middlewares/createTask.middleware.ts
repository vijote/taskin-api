import { BaseMiddleware } from "inversify-express-utils";
import { injectable } from 'inversify'
import { Request, Response, NextFunction } from 'express'
import { AppException, isString } from "../core/utils";

@injectable()
class CreateTaskMiddleware extends BaseMiddleware {
    public handler(req: Request, _res: Response, next: NextFunction) {
        if (isString(req?.body?.title))
            throw new AppException('El titulo es obligatorio', 400)

        if (isString(req?.body?.content))
            throw new AppException('La descripcion es obligatoria', 400)

        next();
    }
}

export default CreateTaskMiddleware