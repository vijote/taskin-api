import { DotenvParseOutput, configDotenv } from "dotenv";
import { injectable } from 'inversify'

@injectable()
class EnvironmentConnection {
    public variables: DotenvParseOutput
    private static expectedVariables = new Set([
        'PORT',
        'DATABASE_URL',
        'SHADOW_DATABASE_URL',
        'ENCRYPTION_KEY',
        'ENCRYPTION_IV',
        'ENCRYPTION_ALGORITHM'
    ])

    constructor() {
        this.variables = configDotenv().parsed

        for (const variable of EnvironmentConnection.expectedVariables) {
            if(!this.variables[variable]) process.exit(1)
        }
    }
}

export default EnvironmentConnection;