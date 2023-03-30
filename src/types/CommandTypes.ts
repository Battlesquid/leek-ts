import type {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder
} from "@discordjs/builders";
import { ChatInputCommandInteraction, PermissionFlags } from "discord.js";
import type LeekClient from "../LeekClient";

export type CommandExec = (
    client: LeekClient,
    inter: ChatInputCommandInteraction
) => Promise<unknown> | unknown;

type BaseCommand = {
    name: string;
    perms: PermissionFlags[keyof PermissionFlags][]
};

export type SlashCommandData = BaseCommand & {
    subcommand?: string | null;
    group?: string | null;
};

export type SlashCommandFunction = SlashCommandData & {
    execute: CommandExec;
};

export type SlashCommand =
    | SlashCommandBuilder
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandGroupBuilder;
