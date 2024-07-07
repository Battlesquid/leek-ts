import { Command, Listener } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ClientEvents, ContextMenuCommandInteraction } from "discord.js";
import { CommandLogger } from "./command_logger";

export abstract class AugmentedSubcommand extends Subcommand {
    get db() {
        return this.container.drizzle;
    }

    public getCommandLogger(interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction | ContextMenuCommandInteraction) {
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

export abstract class AugmentedListener<T extends keyof ClientEvents> extends Listener<T> {
    get db() {
        return this.container.drizzle;
    }

    abstract run(...args: T extends keyof ClientEvents ? ClientEvents[T] : unknown[]): unknown;
}
