import "@sapphire/framework";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema";
import { Client } from "pg";

declare module "@sapphire/pieces" {
    interface Container {
        drizzle: NodePgDatabase<typeof schema>;
        pg: Client;
    }
}
