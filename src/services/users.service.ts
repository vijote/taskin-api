import { injectable } from 'inversify'
import PrismaConnection from "./prisma.connection";

@injectable()
class UsersService {
    private prisma: PrismaConnection;

    constructor(prisma: PrismaConnection) {
        this.prisma = prisma;
    }

    getAll = () => {
        return this.prisma.client.user.findMany()
    }
}

export default UsersService;