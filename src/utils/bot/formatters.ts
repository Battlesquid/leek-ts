import { SubcommandMapping } from "@sapphire/plugin-subcommands";
import { capitalizeFirstLetter, snakeToCamelCase } from "@sapphire/utilities";
import { Snowflake, TimestampStylesString, time } from "discord.js";

export const timestring = (ms: number, style: TimestampStylesString) => {
    return time(Math.round(ms / 1000), style);
};

export const chatInputMethod = (command: string) => {
    return `chatInput${capitalizeFirstLetter(snakeToCamelCase(command))}`;
};

export const chatInputCommand = (command: string): SubcommandMapping => {
    return {
        name: command,
        chatInputRun: chatInputMethod(command)
    };
};

export const messageMethod = (command: string) => {
    return `message${capitalizeFirstLetter(snakeToCamelCase(command))}`;
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
