import type {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder
} from "@discordjs/builders"
import { Collection, CommandInteraction } from "discord.js"
import { LeekClient } from "../LeekClient"
import { SubEvent } from "./EventTypes"

export type CommandExec = (client: LeekClient, inter: CommandInteraction) => Promise<any> | any

export type Command = {
    structure: SlashCommandBuilder
    execute: CommandExec
}

export type Subcommand = {
    structure: SlashCommandSubcommandBuilder
    execute: CommandExec
}

export type ParentCommandBase = {
    structure: SlashCommandBuilder
}

export type GroupCommandBase = {
    structure: SlashCommandSubcommandGroupBuilder
}

export type CommandStructure = SlashCommandBuilder | SlashCommandSubcommandBuilder

export type SlashCommandCollection = Collection<string, CommandStructure>

export type MessageCommandCollection = Collection<string, CommandStructure>

export type UserCommandCollection = Collection<string, CommandStructure>

export type ExecutableCollection = Collection<string, CommandExec>

export type SubeventCollection = Collection<string, SubEvent>