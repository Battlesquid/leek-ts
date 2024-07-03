import { Subcommand } from "@sapphire/plugin-subcommands";
import { Logger } from "pino";

export class LoggerSubcommand extends Subcommand {
    protected logErrorAndReply(logger: Logger<string>, interaction: Subcommand.ChatInputCommandInteraction, errorText: string, error?: unknown) {
        logger.error({ error }, errorText);
        interaction.reply(errorText);
    }

    protected logWarnAndReply(logger: Logger<string>, interaction: Subcommand.ChatInputCommandInteraction, warnText: string, extras?: object) {
        logger.warn({ ...extras }, warnText);
        interaction.reply(warnText);
    }

    protected logInfoAndReply(logger: Logger<string>, interaction: Subcommand.ChatInputCommandInteraction, infoText: string, extras?: object) {
        logger.info({ ...extras }, infoText);
        interaction.reply(infoText);
    }
}