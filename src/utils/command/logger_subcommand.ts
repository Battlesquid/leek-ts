import { Subcommand } from "@sapphire/plugin-subcommands";
import { randomUUID } from "crypto";
import { PinoLoggerAdapter } from "logger/pino_logger_adapter";
import { Logger } from "pino";

export class LoggerSubcommand extends Subcommand {
    protected logger(interaction: Subcommand.ChatInputCommandInteraction) {
        const logger = this.container.logger as PinoLoggerAdapter;
        const child = logger.child({
            guild: interaction.guildId,
            interaction: interaction.commandName,
            hash: randomUUID(),
        });
        return {
            replyInfo: (infoText: string, extras?: object) => this.logInfo(child, interaction, infoText, extras),
            replyWarn: (warnText: string, extras?: object) => this.logWarn(child, interaction, warnText, extras),
            replyError: (errorText: string, error: unknown) => this.logError(child, interaction, errorText, error)
        };
    }

    protected logError(logger: Logger<string>, interaction: Subcommand.ChatInputCommandInteraction, errorText: string, error: unknown) {
        logger.error({ error }, errorText);
        interaction.reply(errorText);
    }

    protected logWarn(logger: Logger<string>, interaction: Subcommand.ChatInputCommandInteraction, warnText: string, extras?: object) {
        logger.warn({ ...extras }, warnText);
        interaction.reply(warnText);
    }

    protected logInfo(logger: Logger<string>, interaction: Subcommand.ChatInputCommandInteraction, infoText: string, extras?: object) {
        logger.info({ ...extras }, infoText);
        interaction.reply(infoText);
    }
}