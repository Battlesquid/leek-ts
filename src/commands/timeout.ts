import { ApplyOptions } from "@sapphire/decorators";
import { isGuildMember, isTextBasedChannel } from "@sapphire/discord.js-utilities";
import { Command } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { GuildBasedChannel, userMention } from "discord.js";
import { eq } from "drizzle-orm";
import ms from "ms";
import { logSettings } from "../db/schema";
import { timeout } from "../interactions";
import { AugmentedCommand, ModerationLogBuilder } from "../utils";

@ApplyOptions<Subcommand.Options>({
    name: timeout.commands.chat.base.name,
    description: timeout.commands.chat.base.description,
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ModerateMembers"],
    requiredClientPermissions: ["ModerateMembers", "SendMessages"]
})
export class TimeoutCommand extends AugmentedCommand {
    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(timeout.commands.chat.base, {
            idHints: ["950533839120367626"]
        });
    }

    public override async chatInputRun(inter: Command.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);

        const member = inter.options.getMember("user");
        const duration = inter.options.getString("duration", true);
        const reason = inter.options.getString("reason", false) ?? "no reason provided";

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
            await member.disableCommunicationUntil(Date.now() + millis, reason);
            logger.info({
                interaction: `Timed out ${member} for ${durationStr} (${reason}).`,
                logger: `Timed out ${member.displayName} for ${durationStr} (${reason}).`
            });
        } catch (error) {
            logger.error("An error occurred", error);
            return;
        }

        const settings = await this.db.query.logSettings.findFirst({
            where: eq(logSettings.gid, inter.guildId)
        });
        if (!settings || settings?.moderation === null) {
            return;
        }

        let channel: GuildBasedChannel | null;
        try {
            channel = await inter.guild.channels.fetch(settings.moderation);
        } catch (error) {
            logger.error("Unable to retreive moderation logging channel.", error, { ephemeral: true });
            // TODO figure out how to detect the channel is truly missing, and not just a fetch error, so that it can be deleted from the db
            return;
        }
        if (!isTextBasedChannel(channel)) {
            logger.warn("The saved moderation logging channel is not a text channel, removing from settings.", { channel: settings.moderation }, { ephemeral: true });
            try {
                await this.db.update(logSettings).set({ moderation: null });
            } catch (error) {
                logger.error("An error occurred while deleting the old moderation log channel", error, { ephemeral: true });
            }
            return;
        }

        const embed = new ModerationLogBuilder("Timeout Administered", inter.user)
            .addField("User", userMention(member.id))
            .addField("Reason", reason, true)
            .addField("Duration", durationStr, true)
            .build()
            .setColor("#edbc37")
            .setTimestamp(Date.now());

        try {
            await channel.send({ embeds: [embed] });
        } catch (error) {
            logger.error("An error occurred while recording the timeout log", error, { ephemeral: true });
        }
    }
}
