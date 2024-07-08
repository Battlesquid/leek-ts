import { Command, ILogger } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { randomUUID } from "crypto";
import { ContextMenuCommandInteraction, InteractionReplyOptions } from "discord.js";
import { Logger } from "pino";
import { PinoLoggerAdapter } from "./pino_logger_adapter";

export interface ExtendedInteractionReplyOptions extends InteractionReplyOptions {
    followUp?: boolean;
    skip?: boolean;
}

export interface SplitCommandLoggerContent {
    logger: string;
    interaction: string;
}

export class CommandLogger {
    private logger: Logger<string>;
    private interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction | ContextMenuCommandInteraction;
    private replied: boolean;

    constructor(logger: ILogger, interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction | ContextMenuCommandInteraction) {
        this.logger = (logger as PinoLoggerAdapter).child({
            guild: interaction.guildId,
            interaction: interaction.commandName,
            hash: randomUUID()
        });
        this.interaction = interaction;
        this.replied = false;
    }

    public async info(content: string | SplitCommandLoggerContent, extras?: object, options?: ExtendedInteractionReplyOptions) {
        const { logger: loggerContent, interaction: interactionContent } = this.parseContent(content);
        this.logger.info({ ...extras }, loggerContent);
        return this.respond(interactionContent, options);
    }

    public async warn(content: string | SplitCommandLoggerContent, extras?: object, options?: ExtendedInteractionReplyOptions) {
        const { logger: loggerContent, interaction: interactionContent } = this.parseContent(content);
        this.logger.warn({ ...extras }, loggerContent);
        return this.respond(interactionContent, options);
    }

    public async error(content: string | SplitCommandLoggerContent, error: unknown, options?: ExtendedInteractionReplyOptions) {
        const { logger: loggerContent, interaction: interactionContent } = this.parseContent(content);
        this.logger.error({ error }, loggerContent);
        return this.respond(interactionContent, options);
    }

    private parseContent(content: string | SplitCommandLoggerContent) {
        if (typeof content === "string") {
            return {
                logger: content,
                interaction: content
            };
        }
        return content;
    }

    private async respond(content: string, options?: ExtendedInteractionReplyOptions) {
        try {
            if (this.replied) {
                await this.interaction.followUp({ content, ...options });
                return;
            }
            await this.interaction.reply({ content, ...options });
            this.replied = true;
        } catch (error) {
            console.error(error);
        }
    }
}
