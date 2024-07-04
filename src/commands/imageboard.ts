import { imageboard } from "@interactions";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { CommandLogger, chatInputCommand } from "utils/command";
import { LoggerSubcommand } from "utils/command/logger_subcommand";

@ApplyOptions<Subcommand.Options>({
    name: imageboard.commands.chat.base.name,
    subcommands: [
        chatInputCommand(imageboard.commands.chat.subcommands.enable.name),
        chatInputCommand(imageboard.commands.chat.subcommands.disable.name),
        chatInputCommand(imageboard.commands.chat.subcommands.whitelist_add.name),
        chatInputCommand(imageboard.commands.chat.subcommands.whitelist_remove.name),
        chatInputCommand(imageboard.commands.chat.subcommands.enable.name),
    ],
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ManageChannels"],
    requiredClientPermissions: ["ManageMessages"]
})
export class ImageBoardCommand extends LoggerSubcommand {

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(imageboard.commands.chat.base, {
            idHints: ["1119674243404279909"]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = new CommandLogger(this.container.logger, inter);
        const channel = inter.options.getChannel("channel", true);
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred", error);
            return;
        }
        if (settings?.boards.includes(channel.id)) {
            logger.info(`${channel} is already an imageboard.`);
            return;
        }

        try {
            if (settings !== null) {
                await container.prisma.imageboard.update({
                    where: { gid: inter.guildId },
                    data: { boards: { push: channel.id } }
                });
            } else {
                await container.prisma.imageboard.create({
                    data: {
                        gid: inter.guildId,
                        boards: [channel.id]
                    }
                });
            }
            logger.info(`Imageboards enabled on ${channel}`);
        } catch (error) {
            logger.error("An unexpected error occurred.", error);
        }
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = this.logger(inter);
        const channel = inter.options.getChannel("channel", true);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred", error);
            return;
        }
        if (settings === null || !settings.boards.includes(channel.id)) {
            logger.info(`You must enable imageboards on ${channel} first.`);
            return;
        }

        const newBoards = settings.boards.filter(b => b !== channel.id);
        try {
            if (newBoards.length === 0) {
                await container.prisma.imageboard.delete({
                    where: { gid: inter.guildId }
                });
            } else {
                await container.prisma.imageboard.update({
                    where: { gid: inter.guildId },
                    data: { boards: { set: newBoards } }
                });
            }
            logger.info(`Imageboards disabled on ${channel}`);
        } catch (error) {
            logger.error("An unexpected error occurred.", error);
        }
    }

    public async chatInputWhitelistAdd(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = this.logger(inter);
        const role = inter.options.getRole("role", true);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred", error);
            return;
        }
        if (settings === null) {
            logger.info("You must set up an imageboard first.");
            return;
        }

        if (settings.whitelist.includes(role.id)) {
            logger.info("Role is already whitelisted.");
            return;
        }

        try {
            await container.prisma.imageboard.update({
                where: { gid: inter.guildId },
                data: {
                    whitelist: { push: role.id }
                }
            });
            logger.info(`${role} whitelisted from imageboard channels.`);
        } catch (error) {
            logger.error("An unexpected error occurred.", error);
        }
    }

    public async chatInputWhitelistRemove(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = this.logger(inter);
        const role = inter.options.getRole("role", true);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred", error);
            return;
        }
        if (settings === null) {
            logger.info("You must set up an imageboard first.");
            return;
        }
        if (!settings.whitelist.includes(role.id)) {
            logger.info("Role is not whitelisted.");
            return;
        }

        try {
            await container.prisma.imageboard.update({
                where: { gid: inter.guildId },
                data: { boards: { set: settings.whitelist.filter(id => id !== role.id) } }
            });
            logger.info(`${role} removed from imageboard whitelist.`);
        } catch (error) {
            logger.error("An unexpected error occurred.", error);
        }
    }

    private async getSettings(guildId: string) {
        try {
            const settings = await container.prisma.imageboard.findFirst({
                where: { gid: guildId }
            });
            return { error: null, settings };
        } catch (error) {
            return { error, settings: null };
        }
    }
}