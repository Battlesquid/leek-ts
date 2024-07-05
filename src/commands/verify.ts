import { VerifyRequestModal } from "../modals";
import { Prisma, VerifySettings } from "@prisma/client";
import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { PaginatedEmbed } from "../utils";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    InteractionCollector,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    inlineCode,
    userMention
} from "discord.js";
import { verify } from "../interactions";
import emojis from "../utils/emojis";
import { LoggerSubcommand } from "../utils/bot/logger_subcommand";

@ApplyOptions<Subcommand.Options>({
    name: "verify",
    subcommands: [
        {
            name: verify.commands.chat.subcommands.list.name,
            chatInputRun: "chatInputList"
        },
        {
            name: verify.commands.chat.subcommands.enable.name,
            chatInputRun: "chatInputEnable"
        },
        {
            name: verify.commands.chat.subcommands.disable.name,
            chatInputRun: "chatInputDisable"
        },
        {
            name: verify.commands.chat.subcommands.add_role.name,
            chatInputRun: "chatInputAddRole"
        },
        {
            name: verify.commands.chat.subcommands.remove_role.name,
            chatInputRun: "chatInputRemoveRole"
        },
        {
            name: verify.commands.chat.subcommands.edit.name,
            chatInputRun: "chatInputEdit"
        },
        {
            name: verify.commands.chat.subcommands.request.name,
            chatInputRun: "chatInputRequest"
        },
        {
            name: verify.commands.chat.subcommands.rescan.name,
            chatInputRun: "chatInputRescan"
        }
    ],
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ManageGuild"],
    requiredClientPermissions: ["ManageRoles", "SendMessages", "ChangeNickname", "UseExternalEmojis"]
})
export class VerifyCommand extends LoggerSubcommand {
    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(verify.commands.chat.base, {
            idHints: ["919820845126385737"]
        });
    }

    private async getSettings(guildId: string) {
        return container.prisma.verifySettings.findFirst({
            where: { gid: guildId }
        });
    }

    public async chatInputRequest(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const modal = new ModalBuilder().setCustomId(VerifyRequestModal.Id).setTitle("Edit React Roles");

        const nameInput = new TextInputBuilder().setCustomId(VerifyRequestModal.NameInput).setLabel("Name").setStyle(TextInputStyle.Paragraph);

        const teamInput = new TextInputBuilder().setCustomId(VerifyRequestModal.TeamInput).setLabel("Team").setStyle(TextInputStyle.Short);

        modal.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput), new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(teamInput));

        await inter.showModal(modal);
    }

    public async chatInputList(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        if (inter.guild === null) {
            return;
        }

        const { prisma } = container;
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const users = await prisma.verifyEntry.findMany({
            where: {
                gid: inter.guildId
            }
        });

        if (users.length === 0) {
            inter.reply("No pending verifications.");
            return;
        }

        const PER_PAGE = 6;
        const pages = PaginatedEmbed.createEmbedPages({
            perPage: PER_PAGE,
            items: users,
            pageRender(pageEmbed, pageNum): void {
                pageEmbed.setTitle("Verification List");
                pageEmbed.setFooter({ text: `Page ${pageNum}/${Math.ceil(users.length / PER_PAGE)}` });
            },
            itemRender(page, data) {
                page.addFields([{ name: data.nick, value: userMention(data.uid) }]);
            }
        });

        const embed = new PaginatedEmbed({
            inter,
            pages,
            otherButtons: [new ButtonBuilder().setCustomId("verify_approve").setEmoji(emojis.CHECKMARK).setStyle(ButtonStyle.Success)],
            timeout: 15000,
            onCollect: (collector, inter) => this.handleVerifyConfirmation(settings, users, collector, inter)
        });

        await embed.send();
    }

    private async handleVerifyConfirmation(
        settings: VerifySettings,
        users: Prisma.VerifyEntryCreateInput[],
        collector: InteractionCollector<ButtonInteraction>,
        inter: ButtonInteraction<"cached" | "raw">
    ) {
        if (inter.guild === null) {
            this.container.logger.warn(`Guild ${inter.guildId} unavailable, exiting verification processing.`);
            collector.stop();
            return;
        }

        if (inter.customId !== "verify_approve") {
            return;
        }

        const promises = await Promise.all(
            users.map(async (user) => {
                try {
                    await inter.guild!.members.edit(user.uid, {
                        roles: settings.roles,
                        nick: user.nick,
                        reason: `Verified by ${inter.user.tag}`
                    });
                    return user;
                } catch (e) {
                    container.logger.error(e);
                }
            })
        );

        const verified = promises.filter((u): u is Prisma.VerifyEntryCreateInput => u !== undefined);
        const failedCount = users.length - verified.length;

        let response = `Verified ${verified.length} user${verified.length !== 1 ? "s" : ""}.`;
        if (users.length !== verified.length) {
            response += `Failed to verify ${failedCount} user${failedCount !== 1 ? "s" : ""}.`;
        }

        await inter.followUp(response);

        if (settings.autogreet && verified.length > 0) {
            const mentions = users
                .filter((u) => verified.find((v) => v.uid === u.uid))
                .map((u) => userMention(u.uid))
                .join(", ");

            const channel = (await inter.guild.channels.fetch(inter.channelId)) as TextChannel;

            channel.send(inlineCode(`Welcome ${mentions}!`));
        }
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const join_ch = inter.options.getChannel("join_channel", true);
        const role = inter.options.getRole("role", true);
        const autogreet = inter.options.getBoolean("autogreet", false) ?? false;

        const settings = await this.getSettings(inter.guildId);
        if (settings) {
            inter.reply("Verification is already enabled.");
            return;
        }

        await container.prisma.verifySettings.create({
            data: {
                gid: inter.guildId,
                autogreet,
                roles: [role.id],
                join_ch: join_ch.id
                // type: ""
            }
        });
        inter.reply("Verification enabled.");
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        await container.prisma.verifySettings.delete({ where: { gid: inter.guildId } });
        inter.reply("Verification disabled.");
    }
    public async chatInputAddRole(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const settings = await this.getSettings(inter.guildId);
        const role = inter.options.getRole("role", true);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const existingRole = settings.roles.find((r) => r === role.id);
        if (existingRole) {
            inter.reply(`${role} is already included.`);
            return;
        }

        await container.prisma.verifySettings.update({
            where: {
                gid: inter.guildId
            },
            data: {
                roles: { push: role.id }
            }
        });

        inter.reply(`Added ${role} to verification roles.`);
    }
    public async chatInputRemoveRole(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const role = inter.options.getRole("role", true);
        const existingRole = settings.roles.find((r) => r === role.id);
        if (existingRole === null) {
            inter.reply(`${role} is not already included.`);
            return;
        }

        if (settings.roles.length === 1) {
            inter.reply("Unable to remove role: a minimum of one role is required. Add more roles, then try again.");
            return;
        }

        await container.prisma.verifySettings.update({
            where: { gid: inter.guildId },
            data: {
                roles: { set: settings.roles.filter((r) => r !== role.id) }
            }
        });

        inter.reply(`Removed ${role} from verification roles.`);
    }

    public async chatInputEdit(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const join_ch = inter.options.getChannel("join_channel", true);
        const autogreet = inter.options.getBoolean("autogreet", false) ?? false;
        await container.prisma.verifySettings.update({
            where: {
                gid: inter.guildId ?? undefined
            },
            data: {
                join_ch: join_ch.id,
                autogreet
            }
        });

        inter.reply("Successfully updated verification settings.");
    }
}
