import { imageboardSlashCommand } from "@interactions";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";

export class ImageBoardCommand extends Subcommand {
    public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: "imageboard",
            subcommands: [
                {
                    name: "enable",
                    chatInputRun: "chatInputEnable",
                },
                {
                    name: "disable",
                    chatInputRun: "chatInputDisable"
                },
                {
                    name: "whitelist_add",
                    chatInputRun: "chatInputWhitelistAdd"
                },
                {
                    name: "whitelist_remove",
                    chatInputRun: "chatInputWhitelistRemove"
                },
            ],
            preconditions: ["GuildTextOnly"],
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(imageboardSlashCommand, {
            idHints: ["1119674243404279909"]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const settings = await this.getSettings(inter.guildId);
        if (settings?.boards.includes(ch.id)) {
            inter.reply(`${ch} is already an imageboard.`);
            return;
        }

        if (settings !== null) {
            await container.prisma.imageboard.update({
                where: { gid: inter.guildId },
                data: { boards: { push: ch.id } }
            });
        } else {
            await container.prisma.imageboard.create({
                data: {
                    gid: inter.guildId,
                    boards: [ch.id]
                }
            });
        }

        inter.reply(`Imageboards enabled on ${ch}`);
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);

        const settings = await this.getSettings(inter.guildId);
        if (settings === null || !settings.boards.includes(ch.id)) {
            inter.reply(`You must enable imageboards on ${ch} first.`);
            return;
        }

        const newBoards = settings.boards.filter(b => b !== ch.id);
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

        inter.reply(`Imageboards disabled on ${ch}`);
    }

    public async chatInputWhitelistAdd(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const role = inter.options.getRole("role", true);

        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("You must set up an imageboard first.");
            return;
        }

        if (settings.whitelist.includes(role.id)) {
            inter.reply("Role is already whitelisted.");
            return;
        }

        await container.prisma.imageboard.update({
            where: { gid: inter.guildId },
            data: {
                whitelist: { push: role.id }
            }
        });

        inter.reply(`${role} whitelisted from imageboard channels.`);
    }

    public async chatInputWhitelistRemove(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const role = inter.options.getRole("role", true);

        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("You must set up an imageboard first.");
            return;
        }

        if (!settings.whitelist.includes(role.id)) {
            inter.reply("Role is not whitelisted.");
            return;
        }

        await container.prisma.imageboard.update({
            where: { gid: inter.guildId },
            data: { boards: { set: settings.whitelist.filter(id => id !== role.id) } }
        });
        inter.reply(`${role} removed from imageboard whitelist.`);
    }

    private async getSettings(guildId: string) {
        return container.prisma.imageboard.findFirst({
            where: { gid: guildId }
        });
    }
}