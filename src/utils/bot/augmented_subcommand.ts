import { Command } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { CommandLogger } from "./command_logger";

export class AugmentedSubcommand extends Subcommand {
    get db() {
        return this.container.drizzle;
    }

    public getCommandLogger(interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction) {
        return new CommandLogger(this.container.logger, interaction);
    }
}
