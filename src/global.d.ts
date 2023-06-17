import { PrismaClient } from "@prisma/client";
import "@sapphire/framework";

declare module '@sapphire/pieces' {
    interface Container {
        prisma: PrismaClient;
    }
}
