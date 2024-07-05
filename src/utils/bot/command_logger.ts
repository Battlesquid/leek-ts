import { Command, ILogger } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { randomUUID } from "crypto";
import { InteractionReplyOptions } from "discord.js";
import { PinoLoggerAdapter } from "../../logger/pino_logger_adapter";
import { Logger } from "pino";

export interface ExtendedInteractionReplyOptions extends InteractionReplyOptions {
    followUp?: boolean;
}

export interface SplitCommandLoggerContent {
    logger: string;
    interaction: string;
}

export class CommandLogger {
    private logger: Logger<string>;
    private interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction;

    constructor(logger: ILogger, interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction) {
        this.logger = (logger as PinoLoggerAdapter).child({
            guild: interaction.guildId,
            interaction: interaction.commandName,
            hash: randomUUID()
        });
        this.interaction = interaction;
    }

    public info(content: string | SplitCommandLoggerContent, extras?: object, options?: ExtendedInteractionReplyOptions) {
        const { logger: loggerContent, interaction: interactionContent } = this.parseContent(content);
        this.logger.info({ ...extras }, loggerContent);
        options?.followUp ? this.interaction.followUp({ content: interactionContent, ...options }) : this.interaction.reply({ content: interactionContent, ...options });
    }

    public warn(content: string | SplitCommandLoggerContent, extras?: object, options?: ExtendedInteractionReplyOptions) {
        const { logger: loggerContent, interaction: interactionContent } = this.parseContent(content);
        this.logger.warn({ ...extras }, loggerContent);
        this.respond(interactionContent, options);
    }

    public error(content: string | SplitCommandLoggerContent, error: unknown, options?: ExtendedInteractionReplyOptions) {
        const { logger: loggerContent, interaction: interactionContent } = this.parseContent(content);
        this.logger.error({ error }, loggerContent);
        this.respond(interactionContent, options);
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

    private respond(content: string, options?: ExtendedInteractionReplyOptions) {
        options?.followUp ? this.interaction.followUp({ content, ...options }) : this.interaction.reply({ content, ...options });
    }
}
