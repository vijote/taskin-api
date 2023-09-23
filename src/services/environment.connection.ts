import { injectable } from 'inversify'

@injectable()
class EnvironmentConnection {
    public variables: NodeJS.ProcessEnv
    private static expectedVariables = new Set([
        'PORT',
        'DATABASE_URL',
        'SHADOW_DATABASE_URL',
        'ENCRYPTION_KEY',
        'ENCRYPTION_IV',
        'ENCRYPTION_ALGORITHM'
    ])

    constructor() {
        this.variables = process.env
        
        let missingVariables = false

        for (const variable of EnvironmentConnection.expectedVariables) {
            if(!this.variables[variable]) {
                console.error('missing variable:', variable)
                missingVariables = true
            }
        }

        if(missingVariables) process.exit(1)
    }
}

export default EnvironmentConnection;