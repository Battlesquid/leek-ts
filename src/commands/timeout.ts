import { timeoutSlashCommand } from "@interactions";
import { Command, container } from "@sapphire/framework";
import { ModerationLogBuilder } from "@utils";
import { ChannelType, userMention } from "discord.js";
import ms from "ms";

export class TimeoutCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            name: "timeout",
            description: "Timeout users",
            preconditions: ["GuildTextOnly"]
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(timeoutSlashCommand, {
            idHints: ["950533839120367626"]
        });
    }

    public override async chatInputRun(inter: Command.ChatInputCommandInteraction<"cached" | "raw">) {
        const user = inter.options.getUser("user", true);
        const duration = inter.options.getString("duration", true);
        const reason = inter.options.getString("reason", false) ?? undefined;

        let millis: number, durationStr: string;
        try {
            millis = ms(duration);
            durationStr = ms(millis);
        } catch (e) {
            inter.reply("An invalid duration was provided.");
            return;
        }

        if (millis < 0) {
            inter.reply("Duration must be a positive value");
            return;
        }

        if (millis > ms("28 days")) {
            inter.reply("Duration must be shorter than 28 days");
            return;
        }

        if (Number.isNaN(millis)) {
            inter.reply(`Invalid duration ${duration}`);
            return;
        }

        const member = await inter.guild?.members.fetch(user.id);
        if (!member) {
            inter.reply(`Unable to find ${user}, please try again later.`);
            return;
        }

        await member
            .disableCommunicationUntil(Date.now() + millis, reason);
        await inter.reply(`Timed out ${user} for ${durationStr}.`);

        const logSettings = await container.prisma.logSettings.findFirst({
            where: { gid: inter.guildId }
        });
        if (!logSettings || logSettings?.moderation === null) {
            return;
        }

        const logCh = await inter.guild?.channels.fetch(logSettings.moderation);
        if (!logCh || logCh.type !== ChannelType.GuildText) {
            await inter.followUp({
                content: `The moderation logging channel ${logSettings.moderation} is missing. Verify that the channel exists, then try again.`
            });
            await container.prisma.logSettings.update({
                where: { gid: inter.guildId },
                data: { moderation: null }
            });
            return;
        }

        const embed = new ModerationLogBuilder("Timeout Administered", inter.user)
            .addField("User", userMention(member.id))
            .addField("Reason", reason ?? "N/A", true)
            .addField("Duration", durationStr, true)
            .build()
            .setColor("#edbc37")
            .setTimestamp(Date.now());

        logCh.send({
            embeds: [embed]
        });
    }
}