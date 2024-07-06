import { Command, Listener } from "@sapphire/framework";
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

export class AugmentedCommand extends Command {
    get db() {
        return this.container.drizzle;
    }

    public getCommandLogger(interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction) {
        return new CommandLogger(this.container.logger, interaction);
    }
}

export class AugmentedListener extends Listener {
    get db() {
        return this.container.drizzle;
    }

    run(..._args: unknown[]): unknown {
        throw new Error("Method not implemented.");
    }
}
