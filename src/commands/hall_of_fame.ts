import { ApplyOptions } from "@sapphire/decorators";
import { isTextBasedChannel } from "@sapphire/discord.js-utilities";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { isNullish, partition } from "@sapphire/utilities";
import {
    ActionRowBuilder,
    Attachment,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    ComponentType,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TimestampStyles
} from "discord.js";
import { eq } from "drizzle-orm";
import { arrayAppend, arrayRemove } from "../db";
import { hallOfFameSettings } from "../db/schema";
import { hall_of_fame } from "../interactions";
import { AugmentedSubcommand, CommandHints, chatInputCommand, messageCommand, slashCommandMention, timestring } from "../utils/bot";
import { pluralize, ttry } from "../utils/general";

@ApplyOptions<Subcommand.Options>({
    name: hall_of_fame.commands.chat.base.name,
    subcommands: [
        chatInputCommand(hall_of_fame.commands.chat.subcommands.enable.name),
        chatInputCommand(hall_of_fame.commands.chat.subcommands.disable.name),
        messageCommand(hall_of_fame.commands.message.promote.name)
    ],
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ManageChannels"],
    requiredClientPermissions: ["ManageMessages", "SendMessages", "AttachFiles", "EmbedLinks"]
})
export class HallOfFameCommand extends AugmentedSubcommand {
    hints() {
        return new CommandHints({
            chat: {
                development: "1126901836243275806",
                production: ""
            },
            message: {
                development: "1126901837249904672",
                production: ""
            }
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        const hints = this.hints();
        registry.registerChatInputCommand(hall_of_fame.commands.chat.base, {
            idHints: [hints.chat.development, hints.chat.production]
        });
        registry.registerContextMenuCommand(hall_of_fame.commands.message.promote, {
            idHints: [hints.message.development, hints.message.production]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const channel = inter.options.getChannel<ChannelType.GuildText>("channel", true);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retreiving your settings.", error);
            return;
        }

        if (!isNullish(settings) && settings.halls.includes(channel.id)) {
            inter.reply(`Hall of fame is already enabled on ${channel}.`);
            return;
        }

        try {
            await this.db
                .insert(hallOfFameSettings)
                .values([
                    {
                        gid: inter.guildId,
                        halls: [channel.id]
                    }
                ])
                .onConflictDoUpdate({
                    target: hallOfFameSettings.gid,
                    set: { halls: arrayAppend(hallOfFameSettings.halls, channel.id) }
                });
            inter.reply(`Enabled hall of fame on ${channel}.`);
        } catch (error) {
            logger.error("An error occurred while enabling hall of fame.", error);
        }
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const channel = inter.options.getChannel("channel", true);
        const { settings, error } = await this.getSettings(inter.guildId);

        if (error) {
            logger.error("An error occurred while retreiving your settings.", error);
            return;
        }
        if (isNullish(settings) || !settings.halls.includes(channel.id)) {
            inter.reply(`Hall of fame is not enabled on ${channel}.`);
            return;
        }
        try {
            await this.db
                .update(hallOfFameSettings)
                .set({ halls: arrayRemove(hallOfFameSettings.halls, channel.id) })
                .where(eq(hallOfFameSettings.gid, inter.guildId));
            inter.reply(`Disabled hall of fame on ${channel}`);
        } catch (error) {
            logger.error("An error occurred while disabling hall of fame.", error);
        }
    }

    public async contextMenuRun(inter: ContextMenuCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        if (!isTextBasedChannel(inter.channel) || !inter.inGuild()) {
            inter.reply("This interaction must run within a text channel.");
            return;
        }

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retreiving your settings.", error);
            return;
        }
        if (isNullish(settings)) {
            const mention = slashCommandMention(hall_of_fame.commands.chat.base.name, hall_of_fame.commands.chat.subcommands.enable.name, "1126901836243275806");
            inter.reply({
                content: `You must create a hall of fame first. Create one with ${mention}.`,
                ephemeral: true
            });
            return;
        }

        const channelData = await Promise.all(
            settings.halls.map(async (hall) => {
                const { result: channel } = await ttry(() => inter.guild.channels.fetch(hall));
                return {
                    exists: !isNullish(channel),
                    channel
                };
            })
        );

        const [existing, missing] = partition(channelData, (channel) => channel.exists);
        const warning = missing.length > 0 ? `Unable to retreive ${missing.length} ${pluralize("hall", missing.length)}.\n` : "";

        const options = existing.map(({ channel }) => {
            return new StringSelectMenuOptionBuilder().setLabel(channel!.name).setValue(channel!.id);
        });

        const selectId = "@leekbot/promote";
        const select = new StringSelectMenuBuilder().setCustomId(selectId).setPlaceholder("Select a hall of fame").setOptions(options);

        await inter.reply({
            content: `${warning}Select a hall of fame to send this message to.`,
            ephemeral: true,
            components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)]
        });

        const collector = inter.channel.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (inter) => inter.customId === selectId,
            idle: 10_000
        });

        collector.on("collect", async (collectedInter) => {
            collector.stop();
            this.handleHallSelection(inter, collectedInter);
        });

        collector.on("end", (c, reason) => {
            if (reason === "time") {
                inter.editReply({
                    content: "Selection timed out.",
                    components: []
                });
            }
        });
    }

    private async handleHallSelection(inter: ContextMenuCommandInteraction<"cached">, selectInter: StringSelectMenuInteraction) {
        const hallChannelId = selectInter.values[0];
        const { result: hall, error: hallError } = await ttry(() => inter.guild.channels.fetch(hallChannelId));
        if (hallError) {
            inter.editReply({
                content: "An error occurred while retreiving channel.",
                components: []
            });
            return;
        }
        const { result: message, ok: messageOk } = await ttry(() => inter.channel!.messages.fetch(inter.targetId));
        if (!messageOk) {
            inter.editReply({
                content: "An error occurred while retreiving target message.",
                components: []
            });
            return;
        }

        if (isNullish(hall)) {
            inter.editReply({
                content: `Unable to find hall of fame (${hallChannelId}).`,
                components: []
            });
            return;
        }

        if (!isTextBasedChannel(hall)) {
            const mention = slashCommandMention(hall_of_fame.commands.chat.base.name, hall_of_fame.commands.chat.subcommands.enable.name, "1126901836243275806");
            inter.editReply({
                content: `${hall} must be a text channel. Edit this channel to be a text channel, or add a new hall of fame using ${mention}.`,
                components: []
            });
            return;
        }

        const author = message.member?.displayName ?? message.author.username;
        const embed = new EmbedBuilder()
            .setAuthor({ name: author, iconURL: message.author.avatarURL() ?? undefined })
            .setDescription(`Submitted ${timestring(message.createdTimestamp, TimestampStyles.LongDateTime)}`);

        const files: string[] = [];
        const attachment = message.attachments.find(this.canEmbedAttachment);
        if (attachment) {
            embed.setImage(attachment.url);
        } else {
            files.push(...message.attachments.map((a) => a.url));
        }

        const original = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Original").setURL(message.url);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(original);

        if (message.hasThread && message.thread !== null) {
            const thread = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("Thread").setURL(message.thread.url);
            row.addComponents(thread);
        }

        await hall.send({
            content: message.content,
            embeds: [embed],
            files,
            components: [row]
        });

        inter.editReply({
            content: `Message sent to ${hall}.`,
            components: []
        });
    }

    private canEmbedAttachment(attachment: Attachment) {
        console.log(attachment.contentType);
        return /jpg|jpeg|png|gif/.test(attachment.contentType ?? "");
    }

    private async getSettings(guildId: string) {
        const { result: settings, error } = await ttry(() =>
            this.db.query.hallOfFameSettings.findFirst({
                where: eq(hallOfFameSettings.gid, guildId)
            })
        );
        return { settings, error };
    }
}
