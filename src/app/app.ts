import 'reflect-metadata'
import { Application, json } from 'express'
import { InversifyExpressServer } from 'inversify-express-utils'
import { DotenvParseOutput } from 'dotenv'
import container from './inversify.config'

// Controllers
import '../controllers/app.controller'
import '../controllers/users.controller'

class App {
    public port: number = 3000
    private server: InversifyExpressServer
    private app: Application

    constructor(env: DotenvParseOutput) {        
        this.port = Number(env.PORT);
        this.server = new InversifyExpressServer(container);
    }

    public initConfig(){
        this.server.setConfig((app: Application) => {
            app.use(json({ limit: '5mb' }))
        })
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