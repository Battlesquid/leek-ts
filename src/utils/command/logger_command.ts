import { Command, ILogger } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { randomUUID } from "crypto";
import { InteractionReplyOptions } from "discord.js";
import { PinoLoggerAdapter } from "logger/pino_logger_adapter";
import { Logger } from "pino";

export interface ExtendedInteractionReplyOptions extends InteractionReplyOptions {
    followUp?: boolean;
}

export class CommandLogger {
    private logger: Logger<string>;
    private interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction;

    constructor(logger: ILogger, interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction) {
        this.logger = (logger as PinoLoggerAdapter).child({
            guild: interaction.guildId,
            interaction: interaction.commandName,
            hash: randomUUID(),
        });
        this.interaction = interaction;
    }

    public info(content: string, extras?: object, options?: ExtendedInteractionReplyOptions) {
        this.logger.info({ ...extras }, content);
        options?.followUp
            ? this.interaction.followUp({ content, ...options })
            : this.interaction.reply({ content, ...options });
    }

    public warn(content: string, extras?: object, options?: ExtendedInteractionReplyOptions) {
        this.logger.warn({ ...extras }, content);
        options?.followUp
            ? this.interaction.followUp({ content, ...options })
            : this.interaction.reply({ content, ...options });
    }

    public error(content: string, error: unknown, options?: ExtendedInteractionReplyOptions) {
        this.logger.error({ error }, content);
        options?.followUp
            ? this.interaction.followUp({ content, ...options })
            : this.interaction.reply({ content, ...options });
    }
}