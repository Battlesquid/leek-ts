import { sql } from "drizzle-orm";
import { NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import { PgColumn } from "drizzle-orm/pg-core";
import { Client } from "pg";
import { config } from "../config";
import * as schema from "./schema";

let DATABASE: NodePgDatabase<typeof schema> | null = null;
let connection: Client | null = null;

export const getPgConnection = async () => {
    if (connection === null) {
        connection = new Client({
            host: config.getenv("DB_HOST"),
            port: parseInt(config.getenv("DB_PORT")),
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

export const arrayAppend = (column: PgColumn, value: unknown) => {
    return sql`array_append(${column}, ${value})`;
};

export const arrayRemove = (column: PgColumn, value: unknown) => {
    return sql`array_remove(${column}, ${value})`;
};

export const arrayReplace = (column: PgColumn, target: unknown, replacement: unknown) => {
    return sql`array_replace(${column}, ${target}, ${replacement})`;
};
