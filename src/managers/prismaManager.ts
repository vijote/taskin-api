import { PrismaClient } from "@prisma/client";
import { injectable } from 'inversify'

@injectable()
class PrismaManager {
    public client: PrismaClient;

    constructor(newClient: PrismaClient) {
        this.client = newClient
    }
}

export default PrismaManager;