import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { isNullish } from "@sapphire/utilities";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    GuildMember,
    Message,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    bold,
    channelMention,
    inlineCode,
    userMention
} from "discord.js";
import { eq } from "drizzle-orm";
import { arrayAppend, arrayRemove, arrayReplace } from "../db";
import { VerifySettings, VerifyUser, verifyEntry, verifySettings } from "../db/schema";
import { VerifyModalHandler } from "../interaction-handlers/verify_modal";
import { verify } from "../interactions";
import { VerifyRequestListener } from "../listeners/verify_request";
import { AugmentedSubcommand, CommandHints, PaginatedEmbed, VERIFY_REGEX, chatInputCommand, emojis, slashCommandMention } from "../utils/bot";
import { pluralize, ttry } from "../utils/general";

@ApplyOptions<Subcommand.Options>({
    name: verify.commands.chat.base.name,
    subcommands: [
        chatInputCommand(verify.commands.chat.subcommands.list.name),
        chatInputCommand(verify.commands.chat.subcommands.enable.name),
        chatInputCommand(verify.commands.chat.subcommands.disable.name),
        chatInputCommand(verify.commands.chat.subcommands.add_role.name),
        chatInputCommand(verify.commands.chat.subcommands.remove_role.name),
        chatInputCommand(verify.commands.chat.subcommands.edit.name),
        chatInputCommand(verify.commands.chat.subcommands.request.name),
        chatInputCommand(verify.commands.chat.subcommands.rescan.name)
    ],
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ManageGuild"],
    requiredClientPermissions: ["ManageRoles", "SendMessages", "ChangeNickname", "UseExternalEmojis"]
})
export class VerifyCommand extends AugmentedSubcommand {
    hints() {
        return new CommandHints({
            chat: {
                development: "919820845126385737",
                production: "957187610416144389"
            }
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        const hints = this.hints();
        registry.registerChatInputCommand(verify.commands.chat.base, {
            idHints: [hints.chat.development, hints.chat.production]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const role = inter.options.getRole("role", true);
        const type = inter.options.getString("type", true);
        const channel = inter.options.getChannel("new_user_channel", true);
        const createGreeting = inter.options.getBoolean("create_greeting", false) ?? false;

        if (role.managed) {
            inter.reply(`${role} is managed by an external service and cannot be used.`);
            return;
        }

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.edit.name, this.hints().getChatId());
            inter.reply(`Verification is already enabled. Edit your settings with ${mention}.`);
            return;
        }

        if (type === "message" && isNullish(channel)) {
            inter.reply("You must specify a new users channel for message verification");
            return;
        }

        const newUserChannel = type === "message" ? channel.id : null;

        try {
            await this.db.insert(verifySettings).values([
                {
                    gid: inter.guildId,
                    type,
                    new_user_channel: newUserChannel,
                    roles: [role.id],
                    create_greeting: createGreeting
                }
            ]);
            inter.reply("Verification enabled.");
        } catch (error) {
            logger.error("An error occurred while enabling verification.", error);
        }
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (isNullish(settings)) {
            inter.reply("Verification is already disabled.");
            return;
        }
        try {
            await this.db.delete(verifySettings).where(eq(verifySettings.gid, inter.guildId));
            inter.reply("Verification disabled.");
        } catch (error) {
            logger.error("An error occurred while disabling verification.", error);
        }
    }

    public async chatInputRequest(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            inter.reply({
                content: "An error occurred while processing your request, please try again later.",
                ephemeral: true
            });
            return;
        }
        if (isNullish(settings)) {
            inter.reply({
                content: "This server does not have verification enabled.",
                ephemeral: true
            });
            return;
        }

        if (settings.type !== "command") {
            inter.reply({
                content: `This server does not have command verification enabled. Send your request in ${channelMention(settings.new_user_channel!)} in the format ${inlineCode("Name | Team")}.`,
                ephemeral: true
            });
            return;
        }

        if (inter.member.roles.cache.hasAll(...settings.roles)) {
            inter.reply({
                content: "You are already verified!",
                ephemeral: true
            });
            return;
        }

        const modal = new ModalBuilder().setCustomId(VerifyModalHandler.MODAL_ID).setTitle("Request Verification");
        const nameInput = new TextInputBuilder().setCustomId(VerifyModalHandler.NAME_INPUT).setLabel("Name").setStyle(TextInputStyle.Short);
        const teamInput = new TextInputBuilder().setCustomId(VerifyModalHandler.TEAM_INPUT).setLabel("Team").setStyle(TextInputStyle.Short);
        modal.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput), new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(teamInput));

        await inter.showModal(modal);
    }

    public async chatInputList(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving your settings.", error);
            return;
        }
        if (isNullish(settings)) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.enable.name, this.hints().getChatId());
            inter.reply(`Verification is not enabled. Enable it with ${mention}.`);
            return;
        }

        const users = await this.db.query.verifyEntry.findMany({
            where: eq(verifyEntry.gid, inter.guildId)
        });

        if (users.length === 0) {
            inter.reply("No pending verifications.");
            return;
        }

        const rescanMention = slashCommandMention(verify.commands.chat.base.name, verify.commands.chat.subcommands.rescan.name, this.hints().getChatId());
        const template = new EmbedBuilder().setColor("Greyple");
        const SUBMIT_ID = "@leekbot/submit";
        new PaginatedEmbed({
            inter,
            title: "Verification List",
            useLargeTitle: true,
            items: users,
            itemsPerPage: 6,
            timeout: 10_000,
            template,
            prev: new ButtonBuilder().setEmoji(emojis.LeftArrow).setStyle(ButtonStyle.Primary),
            next: new ButtonBuilder().setEmoji(emojis.RightArrow).setStyle(ButtonStyle.Primary),
            actions: [new ButtonBuilder().setCustomId(SUBMIT_ID).setEmoji(emojis.Checkmark).setStyle(ButtonStyle.Success)],
            itemFormatter: (user, i) => `${inlineCode(`${i + 1}. `)}  ${bold(user.nick)} •︎ ${userMention(user.uid)}`,
            footerFormatter: () => `Users missing? Run ${rescanMention} to detect missed users.`,
            onCollect: async (collector, inter) => {
                if (inter.customId !== SUBMIT_ID) {
                    return;
                }
                collector.stop();
                await this.onVerifySubmit(settings, users, inter as ButtonInteraction<"cached">);
            }
        }).send();
    }

    public async chatInputAddRole(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const role = inter.options.getRole("role", true);
        if (role.managed) {
            inter.reply(`${role} is managed by an external service and cannot be used.`);
            return;
        }
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (isNullish(settings)) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.enable.name, this.hints().getChatId());
            inter.reply(`Verification is not enabled. Enable it with ${mention}.`);
            return;
        }

        const included = settings.roles.find((r) => r === role.id);
        if (included) {
            inter.reply(`${role} is already included in the list of roles.`);
            return;
        }

        try {
            await this.db
                .update(verifySettings)
                .set({ roles: arrayAppend(verifySettings.roles, role.id) })
                .where(eq(verifySettings.gid, inter.guildId));
            inter.reply(`Added ${role} to verification roles.`);
        } catch (error) {
            logger.error(
                {
                    interaction: `An error occurred while trying to add ${role} to verification roles.`,
                    logger: `An error occurred while trying to add ${role.name} to verification roles.`
                },
                error
            );
        }
    }
    public async chatInputRemoveRole(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const { settings, error } = await this.getSettings(inter.guildId);
        const role = inter.options.getRole("role", true);
        const replacementRole = inter.options.getRole("replacement_role", false);

        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (isNullish(settings)) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.enable.name, this.hints().getChatId());
            inter.reply(`Verification is not enabled. Enable it with ${mention}.`);
            return;
        }

        const included = settings.roles.find((r) => r === role.id);
        if (!included) {
            inter.reply(`${role} is already not included in the list of roles.`);
            return;
        }

        let replaceText = "";
        if (settings.roles.length === 1) {
            if (isNullish(replacementRole)) {
                const mention = slashCommandMention(verify.commands.chat.base.name, verify.commands.chat.subcommands.add_role.name, this.hints().getChatId());
                inter.reply(`A minimum of one role is required. To remove this role, add another in its place using ${mention}, or use the this command's 'replacement_role' option.`);
                return;
            }
            if (replacementRole.managed) {
                inter.reply(`${replacementRole} is managed by an external service and cannot be used.`);
                return;
            }
            replaceText = ` (replaced with ${replacementRole})`;
        }

        try {
            await this.db
                .update(verifySettings)
                .set({
                    roles: settings.roles.length === 1 ? arrayReplace(verifySettings.roles, role.id, replacementRole!.id) : arrayRemove(verifySettings.roles, role.id)
                })
                .where(eq(verifySettings.gid, inter.guildId));
            inter.reply(`Removed ${role} from verification roles${replaceText}.`);
        } catch (error) {
            logger.error(
                {
                    interaction: `An error occurred while trying to remove ${role} from verification roles.`,
                    logger: `An error occurred while trying to remove ${role.name} from verification roles.`
                },
                error
            );
        }
    }

    public async chatInputEdit(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (isNullish(settings)) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.enable.name, this.hints().getChatId());
            inter.reply(`Verification is not enabled. Enable it with ${mention}.`);
            return;
        }

        const type = inter.options.getString("type", false) ?? settings.type;
        const channel = inter.options.getChannel("new_user_channel", false);
        const createGreeting = inter.options.getBoolean("create_greeting", false);

        if (type === "message" && isNullish(channel) && settings.new_user_channel === null) {
            inter.reply("You must specify a new users channel for message verification");
            return;
        }

        const newUserChannel = type === "message" ? channel!.id : null;
        try {
            await this.db
                .update(verifySettings)
                .set({
                    type,
                    new_user_channel: newUserChannel,
                    create_greeting: createGreeting ?? settings.create_greeting
                })
                .where(eq(verifySettings.gid, inter.guildId));
            inter.reply("Successfully updated verification settings.");
        } catch (error) {
            logger.error("An error occurred while editing your verification settings.", error);
        }
    }

    public async chatInputRescan(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        await inter.deferReply();

        const { settings, error: settingsError } = await this.getSettings(inter.guildId);
        if (settingsError) {
            inter.editReply("An error occurred while retrieving settings.");
            return;
        }
        if (isNullish(settings)) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.enable.name, this.hints().getChatId());
            inter.editReply(`Verification is not enabled. Enable it with ${mention}.`);
            return;
        }
        if (settings.type !== "message") {
            inter.editReply("Rescanning is only supported for message verification.");
            return;
        }

        const channel = await this.container.client.channels.fetch(settings.new_user_channel!);
        if (!channel) {
            inter.editReply(`${channelMention(settings.new_user_channel!)} was not found, check that the channel exists, then try again`);
            return;
        }
        if (channel.type !== ChannelType.GuildText) {
            const mention = slashCommandMention(this.name, verify.commands.chat.subcommands.edit.name, this.hints().getChatId());
            inter.editReply(`Rescanning is only supported on text channels. Change your channel settings or update your new user channel with ${mention}, then try again`);
            return;
        }

        const { ok, result: users } = await ttry(() => this.db.query.verifyEntry.findMany({ where: eq(verifyEntry.gid, inter.guildId) }));
        if (!ok) {
            inter.editReply("An error occurred while retreiving existing users, please try again later.");
            return;
        }

        const history = await channel.messages.fetch({ limit: 100 });
        const messages = Array.from(
            history
                .sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp)
                .filter((msg, key, coll) => {
                    const isUser = !msg.author.bot;
                    const nickMatch = msg.content.match(VERIFY_REGEX) !== null;
                    const noExistingEntry = users.find((e) => e.uid === msg.author.id) === undefined;
                    const unique = key === coll.find((m) => m.author.id === msg.author.id)?.id;

                    return isUser && nickMatch && noExistingEntry && unique;
                })
                .values()
        );

        const fetchedMembers = await Promise.all(
            messages.map(async (message) => {
                const { result: member } = await ttry(() => message.guild?.members.fetch(message.author.id));
                return { member, message };
            })
        );
        const scannedUsers = fetchedMembers
            .filter((fetched): fetched is { member: GuildMember; message: Message<true> } => {
                if (fetched.member === null) {
                    return false;
                }
                return !fetched.member.roles.cache.hasAll(...settings.roles);
            })
            .map<VerifyUser>(({ message }) => {
                const match = message.content.match(VERIFY_REGEX)!;
                const nick = VerifyRequestListener.formatNickname(match.groups!.nick, match.groups!.team);
                return {
                    gid: inter.guildId,
                    uid: message.author.id,
                    nick
                };
            });

        if (scannedUsers.length === 0) {
            inter.editReply("Verification list is already up to date.");
            return;
        }

        const { error } = await ttry(() => this.db.insert(verifyEntry).values(scannedUsers).onConflictDoNothing());

        if (error) {
            console.error(error);
            inter.editReply(`An error occurred while rescanning ${channelMention(settings.new_user_channel!)}, please try again later.`);
            return;
        }

        inter.editReply("Rescan complete, verification list updated.");
    }

    private async onVerifySubmit(settings: VerifySettings, users: VerifyUser[], inter: ButtonInteraction<"cached">) {
        const reply = await inter.followUp("Processing verification list, please wait.");

        const handleUserVerify = async (user: VerifyUser) => {
            try {
                await inter.guild.members.edit(user.uid, {
                    roles: settings.roles,
                    nick: user.nick,
                    reason: `Verified by ${inter.user.tag}`
                });
                return user;
            } catch (e) {
                return undefined;
            }
        };

        const promises = await Promise.all(users.map(handleUserVerify));
        const verified = promises.filter((u): u is VerifyUser => u !== undefined);
        const failedCount = users.length - verified.length;

        let response = `Verified ${verified.length} ${pluralize("user", verified.length)}.`;
        if (failedCount !== 0) {
            response += ` Failed to verify ${failedCount} ${pluralize("user", verified.length)}.`;
        }

        ttry(() => {
            return this.db.delete(verifyEntry).where(eq(verifyEntry.gid, inter.guildId));
        });
        await reply.edit(response);

        if (settings.create_greeting && verified.length > 0) {
            const mentions = verified.map((u) => userMention(u.uid)).join(", ");
            const channel = (await inter.guild.channels.fetch(inter.channelId)) as TextChannel;
            ttry(() => channel.send(inlineCode(`Welcome ${mentions}!`)));
        }
    }

    private async getSettings(guildId: string) {
        const { result: settings, error } = await ttry(() =>
            this.db.query.verifySettings.findFirst({
                where: eq(verifySettings.gid, guildId)
            })
        );
        return { settings, error };
    }
}
