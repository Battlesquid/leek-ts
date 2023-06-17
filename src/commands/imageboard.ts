import { imageboardInteraction } from '@interactions';
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';

export class ImageBoardCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'imageboard',
            subcommands: [
                {
                    name: 'enable',
                    chatInputRun: 'chatInputEnable',
                },
                {
                    name: 'disable',
                    chatInputRun: 'chatInputDisable'
                },
                {
                    name: 'whitelist_add',
                    chatInputRun: 'chatInputWhitelistAdd'
                },
                {
                    name: 'whitelist_remove',
                    chatInputRun: 'chatInputWhitelistRemove'
                },
            ],
            preconditions: ["GuildTextOnly"],
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(imageboardInteraction, {
            idHints: ["1119674243404279909"]
        })
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const settings = await this.getSettings(inter.guildId);
        if (settings?.boards.includes(ch.id)) {
            inter.reply(`${ch} is already an imageboard.`);
            return;
        }
        try {
            if (settings !== null) {
                await container.prisma.imageboard.update({
                    where: { gid: inter.guildId },
                    data: { boards: { push: ch.id } }
                })
            } else {
                await container.prisma.imageboard.create({
                    data: {
                        gid: inter.guildId,
                        boards: [ch.id]
                    }
                })
            }

            inter.reply(`${ch} is now an imageboard.`)
        }
        catch (e) {
            container.logger.error(e);
            inter.reply("An error occurred, please try again later.");
        }
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);

        const settings = await this.getSettings(inter.guildId);
        if (settings === null || !settings.boards.includes(ch.id)) {
            inter.reply(`You must enable imageboards on ${ch} first.`);
            return;
        }

        const newBoards = settings.boards.filter(b => b !== ch.id);
        container.prisma.imageboard.update({
            where: { gid: inter.guildId },
            data: { boards: { set: newBoards } }
        })
            .then(() => inter.reply(`Imageboards disabled on ${ch}`))
            .catch((e) => {
                container.logger.error(e);
                inter.reply("An error occurred, please try again later.");
            })
    }

    public async chatInputWhitelistAdd(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const role = inter.options.getRole("role", true);

        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("You must set up a media only channel first.");
            return;
        }

        if (settings.whitelist.includes(role.id)) {
            inter.reply("Role is already whitelisted.");
            return;
        }

        container.prisma.imageboard.update({
            where: { gid: inter.guildId },
            data: {
                whitelist: { push: role.id }
            }
        })
            .then(() => inter.reply(`${role} whitelisted from imageboard channels.`))
            .catch((e) => {
                container.logger.error(e);
                inter.reply("An error occurred, please try again later.");
            })
    }

    public async chatInputWhitelistRemove(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const role = inter.options.getRole("role", true);

        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("You must set up a media only channel first.");
            return;
        }

        if (!settings.whitelist.includes(role.id)) {
            inter.reply("Role is already not whitelisted.");
            return;
        }

        const newWhitelist = settings.whitelist.filter(id => id !== role.id);
        container.prisma.imageboard.update({
            where: { gid: inter.guildId },
            data: { boards: { set: newWhitelist } }
        })
            .then(() => inter.reply(`${role} removed from imageboard whitelist.`))
            .catch((e) => {
                container.logger.error(e);
                inter.reply("An error occurred, please try again later.");
            })
    }

    private async getSettings(guildId: string) {
        return container.prisma.imageboard.findFirst({
            where: { gid: guildId }
        });
    }
}