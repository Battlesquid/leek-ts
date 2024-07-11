import "@sapphire/framework";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";

declare module "@sapphire/pieces" {
    interface Container {
        drizzle: NodePgDatabase<typeof schema>;
        pool: Pool;
    }
}
