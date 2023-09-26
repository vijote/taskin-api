import { injectable } from 'inversify'
import { AppException } from '../core/utils'

@injectable()
class EnvironmentManager {
    public variables: NodeJS.ProcessEnv

    env(variableName: string) {
        const variable = process.env[variableName]
        if (!variable) {
            console.log(`missing environment variable: ${variableName}`)
            throw new AppException(`El servidor tiene configuraciones incorrectas`, 500)
        }

        return variable
    }
}

export default EnvironmentManager;