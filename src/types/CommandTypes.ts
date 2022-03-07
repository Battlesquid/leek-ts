import type {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder
} from "@discordjs/builders"
import type { Collection, CommandInteraction } from "discord.js"
import type LeekClient from "../LeekClient"

export type CommandExec = (client: LeekClient, inter: CommandInteraction) => Promise<any> | any

type BaseCommand = {
    name: string
}

export type SlashCommandData = BaseCommand & {
    subcommand?: string | null
    group?: string | null
}

export type SlashCommandFunction = SlashCommandData & {
    execute: CommandExec
}


export type SlashCommand = SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder

export type CommandStructure = SlashCommandBuilder | SlashCommandSubcommandBuilder

export type SlashCommandCollection = Collection<string, CommandStructure>

export type MessageCommandCollection = Collection<string, CommandStructure>

export type UserCommandCollection = Collection<string, CommandStructure>

export type ExecutableCollection = Collection<SlashCommandData, CommandExec>