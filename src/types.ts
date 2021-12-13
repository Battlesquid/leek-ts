import type { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js"

export abstract class Command {
    abstract structure: any
    abstract execute (interaction: Interaction): Promise<any>
}

export type Handler = (...args: any[]) => Promise<any>

export type EventHandler = {
   handler: Handler
}