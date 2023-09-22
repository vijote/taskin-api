import { NextFunction, Request, Response } from 'express';
import { controller, BaseHttpController, httpGet } from 'inversify-express-utils'

@controller('/')
class AppController extends BaseHttpController {
    @httpGet('/')
    index(_req: Request, res: Response, _next: NextFunction) {
        res.status(200).send("Welcome to Taskin API")
    }
}

export default AppController