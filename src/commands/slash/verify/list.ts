import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction, Formatters, MessageButton, MessageEmbed, Permissions, TextChannel } from "discord.js"
import { getRepository } from "typeorm"
import VerifyList, { VerifyEntry } from "../../../database/entities/VerifyLists"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"
import PaginatedEmbed from "../../../util/PaginatedEmbed"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("Display verification list"),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const listRepo = getRepository(VerifyList);
        const vList = await listRepo.findOne({ gid: inter.guildId });
        if (!vList) {
            inter.reply("No pending verifications.");
            return;
        }

        const pages = PaginatedEmbed.generateFromTemplate<VerifyEntry>({
            perPage: 6,
            entries: vList.users,
            base: new MessageEmbed()
                .setFooter("verify_approve"),
            perPageCallback(page, currPage) {
                page.setTitle(`Verify List - Page ${currPage + 1}`);
            },
            perItemCallback(page, data, currPage) {
                page.addField(data.nick, Formatters.userMention(data.id));
            }
        })

        const approve = new MessageButton()
            .setCustomId("verify_approve")
            .setEmoji("✅")
            .setStyle("SUCCESS")

        const embed = new PaginatedEmbed({
            inter,
            pages,
            otherButtons: [approve],
            timeout: 15000,
            async onCollect(collector, inter) {
                if (inter.customId !== "verify_approve") return;
                if (!inter.guild) return;
                try {
                    const requestingUser = await inter.guild.members.fetch(inter.user.id);
                    if (!requestingUser.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                        inter.followUp({content: "You do not have permission to do that.", ephemeral: true})
                        return;
                    }

                    const settingsRepo = getRepository(VerifySettings);
                    const settings = await settingsRepo.findOneOrFail({ gid: inter.guildId })

                    let successCount = vList.users.length;
                    const failed: string[] = [];

                    for (const user of vList.users) {
                        try {
                            await inter.guild.members.edit(user.id, {
                                roles: settings.roles,
                                nick: user.nick
                            }, `Verified by ${requestingUser.user.tag}`)
                        } catch (e) {
                            successCount--;
                            failed.push(user.id)
                        }
                    }

                    listRepo.delete({ gid: inter.guildId });

                    let greetMsg = "";
                    if (settings.autogreet) {
                        const mentions = vList.users
                            .filter(u => !failed.includes(u.id))
                            .map(u => Formatters.userMention(u.id))
                            .join(", ");
                        greetMsg  = Formatters.inlineCode(`Welcome ${mentions}!`);
                    }

                    if (successCount === vList.users.length) {
                        await inter.followUp(`Verified ${successCount} users.`)
                    } else {
                        await inter.followUp(`Verified ${successCount} users but failed to verify ${failed.length} users.`)
                    }

                    const channel = await inter.guild.channels.fetch(inter.channelId) as TextChannel;
                    channel.send(greetMsg);

                    collector.stop()
                } catch (e) { console.log(e) }
            }
        })

        await embed.send();
    }
}

export default command;