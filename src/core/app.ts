// Inversify dependencies
import 'reflect-metadata'
import { InversifyExpressServer } from 'inversify-express-utils'
import container from './inversify.config'

// Express specific
import { Application, json } from 'express'

// Controllers
import '../controllers/app.controller'
import '../controllers/users.controller'
import '../controllers/tasks.controller'

// Validation Middlewares
import ErrorMiddleware from '../middlewares/errorHandler.middleware'

class App {
    public port: number
    private server: InversifyExpressServer
    private app: Application

    constructor(port: string) {
        this.port = Number(port || 3000);
        this.server = new InversifyExpressServer(container);
    }

    public initConfig(){
        this.server.setConfig((app: Application) => {
            app.use(json({ limit: '5mb' }))
        })

        this.server.setErrorConfig(app => app.use(ErrorMiddleware))
    }

    public build() {
        this.app = this.server.build();
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log("Taskin API listening on", this.port);
        })
    }
}

export default App