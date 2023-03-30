import VerifyEntry from "#entities/VerifyEntry";
import VerifySettings from "#entities/VerifySettings";
import { SlashCommandFunction } from "#types/CommandTypes";
import EmojiConstants from "#util/EmojiConstants";
import PaginatedEmbed from "#util/PaginatedEmbed";
import {
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    inlineCode, PermissionsBitField,
    TextChannel,
    userMention
} from "discord.js";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "list",
    perms: [PermissionsBitField.Flags.ManageGuild],
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const orm = await client.orm;
        const em = orm.em.fork();

        const settings = await em.findOne(VerifySettings, {
            gid: inter.guildId,
        });
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const list = await em.find(VerifyEntry, { gid: inter.guildId });
        if (!list.length) {
            inter.reply("No pending verifications.");
            return;
        }

        const pages = PaginatedEmbed.generateFromTemplate<VerifyEntry>({
            perPage: 6,
            entries: list,
            base: new EmbedBuilder().setFooter({ text: "verify_approve" }),
            perPageCallback(page, currPage) {
                page.setTitle(`Verify List - Page ${currPage + 1}`);
            },
            perItemCallback(page, data) {
                page.addFields([{ name: data.nick, value: userMention(data.uid) }]);
            },
        });

        const approve = new ButtonBuilder()
            .setCustomId("verify_approve")
            .setEmoji(EmojiConstants.CHECKMARK)
            .setStyle(ButtonStyle.Success);

        const embed = new PaginatedEmbed({
            inter,
            pages,
            prev: new ButtonBuilder()
                .setEmoji(EmojiConstants.LEFT_ARROW)
                .setStyle(ButtonStyle.Primary),
            next: new ButtonBuilder()
                .setEmoji(EmojiConstants.RIGHT_ARROW)
                .setStyle(ButtonStyle.Primary),
            otherButtons: [approve],
            timeout: 15000,
            async onCollect(collector, inter) {
                if (inter.customId !== "verify_approve") return;
                if (!inter.guild) return;

                try {
                    const requestingUser = await inter.guild.members.fetch(
                        inter.user.id
                    );
                    if (
                        !requestingUser.permissions.has(
                            PermissionsBitField.Flags.ManageRoles
                        )
                    ) {
                        inter.followUp({
                            content: "You do not have permission to do that.",
                            ephemeral: true,
                        });
                        return;
                    }

                    let successCount = list.length;
                    const failed: string[] = [];

                    for (const user of list) {
                        try {
                            await inter.guild.members.edit(
                                user.uid,
                                {
                                    roles: settings.roles,
                                    nick: user.nick,
                                    reason: `Verified by ${requestingUser.user.tag}`
                                }
                            );
                        } catch (e) {
                            console.error(e);
                            successCount--;
                            failed.push(user.uid);
                        }
                    }

                    em.removeAndFlush(list);

                    const followUpMsg = successCount === list.length
                        ? `Verified ${successCount} user${successCount !== 1 ? "s" : ""}.`
                        : `Verified ${successCount} user${successCount !== 1 ? "s" : ""}. Failed to verify ${failed.length} user${failed.length !== 1 ? "s" : ""}.`

                    await inter.followUp(followUpMsg);

                    if (settings.autogreet) {
                        const mentions = list
                            .filter((u) => !failed.includes(u.uid))
                            .map((u) => userMention(u.uid))
                            .join(", ");

                        const channel = (await inter.guild.channels.fetch(
                            inter.channelId
                        )) as TextChannel;
                        channel.send(
                            inlineCode(`Welcome ${mentions}!`)
                        );
                    }

                    collector.stop();
                } catch (e) {
                    console.error(e);
                }
            },
        });

        await embed.send();
    },
};

export default command;
