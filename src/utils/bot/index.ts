import { SubcommandMapping } from "@sapphire/plugin-subcommands";
import { capitalize } from "../../utils/strings";
import { snakeToCamelCase } from "@sapphire/utilities";
import { Snowflake } from "discord.js";

export const chatInputMethod = (command: string) => {
    return `chatInput${capitalize(snakeToCamelCase(command))}`;
};

export const chatInputCommand = (command: string): SubcommandMapping => {
    return {
        name: command,
        chatInputRun: chatInputMethod(command)
    };
};

export const messageMethod = (command: string) => {
    return `message${capitalize(snakeToCamelCase(command))}`;
};

export const messageCommand = (command: string): SubcommandMapping => {
    return {
        name: command,
        messageRun: messageMethod(command)
    };
};

export const slashCommandMention = (command: string, subcommand: string | undefined, id: Snowflake) => {
    const formattedSubcommand = subcommand === undefined ? "" : ` ${subcommand}`;
    return `</${command}${formattedSubcommand}:${id}>`;
};

export * from "./command_logger";
export * from "./logger_subcommand";
export * from "./augments";
