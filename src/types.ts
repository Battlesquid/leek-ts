import type { SlashCommandBuilder } from "@discordjs/builders"

export type Command = {
    structure: SlashCommandBuilder
    execute: (...args: any[]) => any
}

export type Handler = (...args: any[]) => Promise<any>
export type EventHandler = {
    handler: Handler
}