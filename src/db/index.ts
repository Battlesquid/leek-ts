import { config } from "../config";
import { Client } from "pg";
import * as schema from "./schema";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";

let DATABASE: NodePgDatabase<typeof schema> | null = null;
let connection: Client | null = null;

export const getPgConnection = async () => {
    if (connection === null) {
        connection = new Client({
            host: config.getenv("DB_HOST"),
            port: parseInt(config.getenv("DB_HOST")),
            user: config.getenv("DB_USER"),
            password: config.getenv("DB_PASSWORD"),
            database: config.getenv("DB_NAME")
        });
    }
    return connection;
};

export const getDatabase = async (): Promise<NodePgDatabase<typeof schema>> => {
    if (DATABASE === null) {
        const client = await getPgConnection();
        await client.connect();
        DATABASE = drizzle(client, { schema });
    }
    return DATABASE;
};
