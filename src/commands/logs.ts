import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { logsSlashCommand } from "@interactions";

type LogType = "text" | "image" | "moderation";

export class LogsCommand extends Subcommand {
    public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: "logs",
            subcommands: [
                {
                    name: "enable",
                    chatInputRun: "chatInputEnable",
                },
                {
                    name: "disable",
                    chatInputRun: "chatInputDisable"
                },
            ],
            preconditions: ["GuildTextOnly"]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(logsSlashCommand, {
            idHints: ["926913960391893072"]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const type = inter.options.getString("type", true) as LogType;
        const settings = await this.getSettings(inter.guildId);

        if (settings === null) {
            await container.prisma.logSettings.create({
                data: {
                    gid: inter.guildId,
                    [type]: ch.id
                }
            });
        } else {
            await container.prisma.logSettings.update({
                where: { gid: inter.guildId },
                data: { [type]: ch.id }
            });
        }

        inter.reply(`Enabled ${type} logging on ${ch}.`);
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const type = inter.options.getString("type", true) as LogType;
        const settings = await this.getSettings(inter.guildId);

        if (settings === null || settings[type] === null) {
            inter.reply(`${type.toUpperCase()} logging must be enabled first.`);
            return;
        }

        await container.prisma.logSettings.update({
            where: { gid: inter.guildId },
            data: { [type]: null }
        });

        inter.reply(`Disabled ${type} logging.`);
    }

    private async getSettings(guildId: string) {
        return container.prisma.logSettings.findFirst({
            where: { gid: guildId }
        });
    }
}
