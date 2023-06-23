import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { logsInteraction } from '@interactions';

export class LogsCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'logs',
            subcommands: [
                {
                    name: 'enable',
                    chatInputRun: 'chatInputEnable',
                },
                {
                    name: 'disable',
                    chatInputRun: 'chatInputDisable'
                },
            ],
            preconditions: ["GuildTextOnly"]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(logsInteraction, {
            idHints: ["926913960391893072"]
        })
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const type = inter.options.getString("type", true) as "image" | "text";
        const settings = await this.getSettings(inter.guildId);
        const key: "t_log_ch" | "i_log_ch" = type === "image"
            ? "t_log_ch"
            : "i_log_ch";

        if (settings === null) {
            await container.prisma.log_settings.create({
                data: {
                    gid: inter.guildId,
                    [key]: ch.id
                }
            })
        } else {
            await container.prisma.log_settings.update({
                where: { gid: inter.guildId },
                data: { [key]: ch.id }
            })
        }

        inter.reply(`Enabled ${type} logging on ${ch}.`);
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const type = inter.options.getString("type", true) as "image" | "text";
        const settings = await this.getSettings(inter.guildId);
        const [targetKey, otherKey]: ("t_log_ch" | "i_log_ch")[] = type === "image"
            ? ["t_log_ch", "i_log_ch"]
            : ["i_log_ch", "t_log_ch"];

        if (settings === null || settings[targetKey] === null) {
            inter.reply(`${type.toUpperCase()} logging must be enabled first.`);
            return;
        }

        if (settings[otherKey] === null) {
            await container.prisma.log_settings.delete({
                where: { gid: inter.guildId }
            })
        } else {
            await container.prisma.log_settings.update({
                where: { gid: inter.guildId },
                data: { [targetKey]: null }
            })
        }

        inter.reply(`Disabled ${type} logging.`);
    }

    private async getSettings(guildId: string) {
        return container.prisma.log_settings.findFirst({
            where: { gid: guildId }
        });
    }

}