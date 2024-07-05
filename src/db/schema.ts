import { sql } from "drizzle-orm";
import { boolean, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const imageboard = pgTable("imageboard", {
    gid: varchar("gid").primaryKey(),
    boards: text("boards").array().notNull(),
    whitelist: text("whitelist")
        .array()
        .default(sql`'{}'::text[]`)
        .notNull()
});

export const logSettings = pgTable("log_settings", {
    gid: varchar("gid").primaryKey(),
    message: varchar("message"),
    image: varchar("image"),
    moderation: varchar("moderation")
});

export const verifyEntry = pgTable("verify_entry", {
    id: serial("id").primaryKey(),
    gid: varchar("gid").notNull(),
    uid: varchar("uid").notNull(),
    nick: varchar("nick", { length: 32 }).notNull()
});

export const verifySettings = pgTable("verify_settings", {
    gid: varchar("gid").notNull(),
    join_ch: varchar("join_ch").notNull(),
    roles: text("roles").array().notNull(),
    autogreet: boolean("autogreet").default(false).notNull()
});
