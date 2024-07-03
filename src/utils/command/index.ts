import { SubcommandMapping } from "@sapphire/plugin-subcommands";
import { capitalize } from "utils/strings";

export const chatInputMethod = (command: string) => {
    return `chatInput${capitalize(command)}`;
};

export const chatInputCommand = (command: string): SubcommandMapping => {
    return {
        name: command,
        chatInputRun: chatInputMethod(command)
    };
};

export const messageCommand = (command: string): SubcommandMapping => {
    return {
        name: command,
        messageRun: `message${capitalize(command)}`
    };
};

export * from "./logger_command";
export * from "./logger_subcommand";