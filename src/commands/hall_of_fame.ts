import { HallOfFameIds, hallOfFameContextCommand, hallOfFameSlashCommand } from "@interactions";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { timestring } from "@utils";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Snowflake, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, TimestampStyles } from "discord.js";

type HallChannel<> = {
    id: Snowflake;
    exists: boolean;
    name: string | undefined;
}

export class HallOfFameCommand extends Subcommand {
    public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: "hall_of_fame",
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
                    name: "promote",
                    messageRun: "messagePromote"
                }
            ],
            preconditions: ["GuildTextOnly"]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(hallOfFameSlashCommand, {
            idHints: ["1126901836243275806"]
        });
        registry.registerContextMenuCommand(hallOfFameContextCommand, {
            idHints: ["1126901837249904672"]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const settings = await this.getSettings(inter.guildId);

        if (settings === null) {
            await container.prisma.hallOfFame.create({
                data: {
                    gid: inter.guildId,
                    halls: [ch.id]
                }
            });
        } else {
            await container.prisma.hallOfFame.update({
                where: { gid: inter.guildId },
                data: { halls: { push: ch.id } }
            });
        }

        inter.reply(`Enabled hall of fame on ${ch}.`);
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const settings = await this.getSettings(inter.guildId);

        if (settings === null || !settings.halls.includes(ch.id)) {
            inter.reply(`Hall of fame must be enabled on ${ch} first.`);
            return;
        }

        const newHalls = settings.halls.filter(h => h !== ch.id);
        await container.prisma.hallOfFame.update({
            where: { gid: inter.guildId },
            data: { halls: { set: newHalls } }
        });

        inter.reply(`Disabled hall of fame on ${ch}`);
    }

    public async contextMenuRun(inter: Subcommand.ContextMenuCommandInteraction<"cached" | "raw">) {
        const { guild, channel } = inter;
        const settings = await this.getSettings(inter.guildId);
        if (!guild || !channel) {
            return;
        }

        if (settings === null) {
            inter.reply({
                content: "You must create a hall of fame first.",
                ephemeral: true
            });
            return;
        }

        const channelData = await Promise.all(
            settings.halls.map(async hall => {
                const ch = await guild.channels.fetch(hall);
                return {
                    exists: ch !== null,
                    name: ch?.name,
                    id: hall
                };
            })
        );

        const existing: HallChannel[] = [];
        const missing: HallChannel[] = [];
        channelData.forEach(ch => ch.exists ? existing.push(ch) : missing.push(ch));

        // let warning = "";
        if (missing.length > 0) {
            // warning = "Warning, missing halls detected. "
        }

        const options = existing.map(ch => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(ch.name!)
                .setValue(ch.id);
        });

        const select = new StringSelectMenuBuilder()
            .setCustomId(HallOfFameIds.SELECT)
            .setPlaceholder("Select a hall of fame")
            .setOptions(options);

        await inter.reply({
            content: "Select a hall of fame to send this message to.",
            ephemeral: true,
            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select)
            ],
        });

        const collector = channel.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (inter) => inter.customId === HallOfFameIds.SELECT,
            idle: 10_000
        });

        collector.on("collect", async collectedInter => {
            collector.stop();

            const hallChannelId = collectedInter.values[0];
            const hall = await guild.channels.fetch(hallChannelId) as TextChannel | null;
            const msg = await channel.messages.fetch(inter.targetId);

            if (hall === null) {
                inter.editReply({
                    content: `Unable to find hall of fame (${hallChannelId}).`,
                    components: []
                });
                return;
            }

            const author = msg.member?.displayName ?? msg.author.username;
            const embed = new EmbedBuilder()
                .setAuthor({ name: author, iconURL: msg.author.avatarURL() ?? undefined })
                .setDescription(`Submitted ${timestring(msg.createdTimestamp, TimestampStyles.LongDateTime)}`);

            const files: string[] = [];
            // TODO check if attachment is an image
            if (msg.attachments.size === 1) {
                 
                embed.setImage(msg.attachments.first()!.url);
            } else {
                files.push(...msg.attachments.map(a => a.url));
            }



            const original = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Original")
                .setURL(msg.url);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(original);

            if (msg.hasThread && msg.thread !== null) {
                const thread = new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Thread")
                    .setURL(msg.thread.url);
                row.addComponents(thread);
            }

            await hall.send({
                content: msg.content,
                embeds: [embed],
                files,
                components: [row]
            });

            inter.editReply({
                content: `Message sent to ${hall.name}.`,
                components: []
            });
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

    private async getSettings(guildId: string) {
        return container.prisma.hallOfFame.findFirst({
            where: { gid: guildId }
        });
    }
}
