import { PrismaClient } from "@prisma/client";
import { injectable } from 'inversify'

@injectable()
class PrismaConnection {
    public client: PrismaClient;

    constructor() {
        this.client = new PrismaClient()
    }
}

export default PrismaConnection;