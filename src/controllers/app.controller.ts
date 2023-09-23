import { controller, BaseHttpController, httpGet } from 'inversify-express-utils'

@controller('/')
class AppController extends BaseHttpController {
    @httpGet('/')
    index() {
        return this.ok("Welcome to Taskin API")
    }
}

export default AppController