import type { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { LeekClient } from "./LeekClient"

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

export type Handler = (client: LeekClient, ...args: any[]) => Promise<any> | any

export type EventHandler = {
    handler: Handler
}

export type CommandValidator = {
    passes: (inter: CommandInteraction) => Promise<any> | any
    onFail: (inter: CommandInteraction) => Promise<any> | any
}

export type Validators = {
    [key: string]: CommandValidator
}