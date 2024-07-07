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

export type ModalSchemaInput = {
    customId: string;
    label: string;
    style: TextInputStyle;
    minLength?: number;
    maxLength?: number;
    value?: string;
    required?: boolean;
};

export type ModalSchema<T extends string[] = [string]> = {
    id: string;
    title: string;
    inputs: {
        [K in T[number]]: ModalSchemaInput;
    };
};
