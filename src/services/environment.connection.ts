import { injectable } from 'inversify'
import { AppException } from '../core/utils'

@injectable()
class EnvironmentConnection {
    public variables: NodeJS.ProcessEnv

    env(variableName: string) {
        const variable = process.env[variableName]
        if (!variable) {
            console.log(`missing environment variable: ${variableName}`)
            throw new AppException(`Missing server configuration`, 500)
        }

        return variable
    }
}

export default EnvironmentConnection;