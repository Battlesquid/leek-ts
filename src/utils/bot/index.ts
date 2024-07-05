import { SubcommandMapping } from "@sapphire/plugin-subcommands";
import { capitalize } from "../../utils/strings";
import { snakeToCamelCase } from "@sapphire/utilities";

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

export * from "./command_logger";
export * from "./logger_subcommand";
export * from "./augments";
