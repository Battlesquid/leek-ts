import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ChannelType } from "discord.js";
import { eq } from "drizzle-orm";
import { arrayAppend, arrayRemove } from "../db";
import { imageboard as imageboardTable } from "../db/schema";
import { imageboard } from "../interactions";
import { AugmentedSubcommand, chatInputCommand } from "../utils/bot";

@ApplyOptions<Subcommand.Options>({
    name: imageboard.commands.chat.base.name,
    subcommands: [
        chatInputCommand(imageboard.commands.chat.subcommands.enable.name),
        chatInputCommand(imageboard.commands.chat.subcommands.disable.name),
        chatInputCommand(imageboard.commands.chat.subcommands.whitelist_add.name),
        chatInputCommand(imageboard.commands.chat.subcommands.whitelist_remove.name),
        chatInputCommand(imageboard.commands.chat.subcommands.enable.name)
    ],
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ManageChannels"],
    requiredClientPermissions: ["ManageMessages"]
})
export class ImageBoardCommand extends AugmentedSubcommand {
    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(imageboard.commands.chat.base, {
            idHints: ["1119674243404279909"]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const channel = inter.options.getChannel<ChannelType.GuildText>("channel", true);
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving your settings.", error);
            return;
        }

        if (settings?.boards.includes(channel.id)) {
            logger.info({
                interaction: `Imageboard already enabled on ${channel}.`,
                logger: `Imageboard already enabled on ${channel.name}.`
            });
            return;
        }

        try {
            await this.db
                .insert(imageboardTable)
                .values([
                    {
                        gid: inter.guildId,
                        boards: [channel.id]
                    }
                ])
                .onConflictDoUpdate({
                    target: imageboardTable.gid,
                    set: { boards: arrayAppend(imageboardTable.boards, channel.id) }
                });
            logger.info({
                interaction: `Enabled imageboard on ${channel}.`,
                logger: `Enabled imageboard on ${channel.name}.`
            });
        } catch (error) {
            logger.error("An error occurred", error);
        }
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const channel = inter.options.getChannel<ChannelType.GuildText>("channel", true);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving your settings.", error);
            return;
        }
        if (!settings?.boards.includes(channel.id)) {
            logger.info({
                interaction: `You must enable imageboards on ${channel} first.`,
                logger: `You must enable imageboards on ${channel.name} first.`
            });
            return;
        }

        try {
            await this.db
                .update(imageboardTable)
                .set({ boards: arrayRemove(imageboardTable.boards, channel.id) })
                .where(eq(imageboardTable.gid, inter.guildId));
            logger.info({
                interaction: `Disabled imageboard on ${channel}.`,
                logger: `Disabled imageboard on ${channel.name}.`
            });
        } catch (error) {
            logger.error("An error occurred", error);
        }
    }

    public async chatInputWhitelistAdd(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);

        const role = inter.options.getRole("role", true);
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving your settings.", error);
            return;
        }
        if (settings === undefined) {
            logger.info("You must set up an imageboard first.");
            return;
        }
        if (settings.whitelist.includes(role.id)) {
            logger.info("Role is already whitelisted.");
            return;
        }

        try {
            await this.db
                .update(imageboardTable)
                .set({ whitelist: arrayAppend(imageboardTable.whitelist, role.id) })
                .where(eq(imageboardTable.gid, inter.guildId));
            logger.info({
                interaction: `Added ${role} to imageboard whitelist.`,
                logger: `Added ${role.name} to imageboard whitelist.`
            });
        } catch (error) {
            logger.error("An unexpected error occurred.", error);
        }
    }

    public async chatInputWhitelistRemove(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = this.getCommandLogger(inter);
        const role = inter.options.getRole("role", true);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings === undefined) {
            logger.info("You must set up an imageboard first.");
            return;
        }
        if (!settings.whitelist.includes(role.id)) {
            logger.info("Role is not whitelisted.");
            return;
        }

        try {
            await this.db
                .update(imageboardTable)
                .set({ whitelist: arrayRemove(imageboardTable.whitelist, role.id) })
                .where(eq(imageboardTable.gid, inter.guildId));
            logger.info({
                interaction: `Removed ${role} from imageboard whitelist.`,
                logger: `Removed ${role.name} from imageboard whitelist.`
            });
        } catch (error) {
            logger.error("An unexpected error occurred.", error);
        }
    }

    private async getSettings(guildId: string) {
        try {
            const settings = await this.db.query.imageboard.findFirst({
                where: eq(imageboardTable.gid, guildId)
            });
            return { error: null, settings };
        } catch (error) {
            return { error, settings: undefined };
        }
    }
}
