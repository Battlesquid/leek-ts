import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember, isTextBasedChannel } from "@sapphire/discord.js-utilities";
import { Command, container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { CommandLogger, ModerationLogBuilder } from "@utils";
import { userMention } from "discord.js";
import { timeout } from "interactions";
import ms from "ms";

@ApplyOptions<Subcommand.Options>({
    name: timeout.commands.chat.base.name,
    description: timeout.commands.chat.base.description,
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ModerateMembers"],
    requiredClientPermissions: ["ModerateMembers", "SendMessages"]
})
export class TimeoutCommand extends Command {

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(timeout.commands.chat.base, {
            idHints: ["950533839120367626"]
        });
    }

    public override async chatInputRun(inter: Command.ChatInputCommandInteraction<"cached">) {
        const logger = new CommandLogger(this.container.logger, inter);

        const member = inter.options.getMember("user");
        const duration = inter.options.getString("duration", true);
        const reason = inter.options.getString("reason", false) ?? "No reason provided.";

        if (member === null || !isGuildMember(member)) {
            logger.warn("Unable to find member, please try again later.");
            return;
        }

        let millis: number;
        let durationStr: string;
        try {
            millis = ms(duration);
            durationStr = ms(millis);
        } catch (e) {
            logger.error("An invalid duration was provided.", e);
            return;
        }

        if (millis < 0) {
            logger.warn("Duration must be a positive value");
            return;
        }

        if (millis > ms("28 days")) {
            logger.warn("Duration must be shorter than 28 days");
            return;
        }

        if (Number.isNaN(millis)) {
            logger.warn(`Invalid duration ${duration}`);
            return;
        }

        try {
            await member
                .disableCommunicationUntil(Date.now() + millis, reason);
            logger.info(`Timed out ${member} for ${durationStr} (${reason}).`);
        } catch (error) {
            logger.error("An error occurred", error);
            return;
        }

        const settings = await container.prisma.logSettings.findFirst({
            where: { gid: inter.guildId }
        });
        if (!settings || settings?.moderation === null) {
            return;
        }

        const channel = await inter.guild.channels.fetch(settings.moderation);
        if (!isTextBasedChannel(channel)) {
            await inter.followUp({
                content: `The moderation logging channel ${settings.moderation} is missing. Verify that the channel exists, then try again.`
            });
            await container.prisma.logSettings.update({
                where: { gid: inter.guildId },
                data: { moderation: null }
            });
            return;
        }

        const embed = new ModerationLogBuilder("Timeout Administered", inter.user)
            .addField("User", userMention(member.id))
            .addField("Reason", reason, true)
            .addField("Duration", durationStr, true)
            .build()
            .setColor("#edbc37")
            .setTimestamp(Date.now());

        channel.send({
            embeds: [embed]
        })
            .catch(e => this.container.logger.error(`An error occurred while recording the timeout log: ${e}`));
    }
}