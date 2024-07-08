import { Command, Listener } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ClientEvents, ContextMenuCommandInteraction, Snowflake } from "discord.js";
import { CommandLogger } from "./command_logger";
import { config } from "../../config";

export interface CommandHint {
    development: Snowflake;
    production: Snowflake;
}

export interface CommandHintsOptions {
    chat?: CommandHint;
    message?: CommandHint;
    user?: CommandHint;
}

export class CommandHints {
    readonly chat: CommandHint;
    readonly message: CommandHint;
    readonly user: CommandHint;

    constructor({ chat, message, user }: CommandHintsOptions) {
        this.chat = chat ?? { development: "", production: "" };
        this.message = message ?? { development: "", production: "" };
        this.user = user ?? { development: "", production: "" };
    }

    getChatId() {
        return config.getenv("NODE_ENV") === "development" ? this.chat.development : this.chat.production;
    }

    getMessageId() {
        return config.getenv("NODE_ENV") === "development" ? this.message.development : this.message.production;
    }

    getUserId() {
        return config.getenv("NODE_ENV") === "development" ? this.user.development : this.user.production;
    }
}

export abstract class AugmentedSubcommand extends Subcommand {
    get db() {
        return this.container.drizzle;
    }

    public getCommandLogger(interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction | ContextMenuCommandInteraction) {
        return new CommandLogger(this.container.logger, interaction);
    }

    public abstract hints(): CommandHints;
}

export abstract class AugmentedCommand extends Command {
    get db() {
        return this.container.drizzle;
    }

    public getCommandLogger(interaction: Subcommand.ChatInputCommandInteraction | Command.ChatInputCommandInteraction) {
        return new CommandLogger(this.container.logger, interaction);
    }

    public abstract hints(): CommandHints;
}

export abstract class AugmentedListener<T extends keyof ClientEvents> extends Listener<T> {
    get db() {
        return this.container.drizzle;
    }

    abstract run(...args: T extends keyof ClientEvents ? ClientEvents[T] : unknown[]): unknown;
}
