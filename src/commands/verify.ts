import { ApplyOptions } from "@sapphire/decorators";
import { PaginatedFieldMessageEmbed } from "@sapphire/discord.js-utilities";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { arrayAppend, arrayRemove } from "../db";
import {
    ActionRowBuilder,
    ButtonInteraction,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    inlineCode,
    userMention
} from "discord.js";
import { eq } from "drizzle-orm";
import { pluralize } from "../utils/strings";
import { VerifySettings, VerifyUser, verifyEntry, verifySettings } from "../db/schema";
import { verify } from "../interactions";
import { VerifyRequestModal } from "../modals";
import { AugmentedSubcommand, CommandLogger, chatInputCommand } from "../utils";
import emojis from "../utils/emojis";

@ApplyOptions<Subcommand.Options>({
    name: "verify",
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
    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(verify.commands.chat.base, {
            idHints: ["919820845126385737"]
        });
    }

    private async getSettings(guildId: string) {
        try {
            const settings = await this.db.query.verifySettings.findFirst({
                where: eq(verifySettings.gid, guildId)
            });
            return { error: null, settings };
        } catch (error) {
            return { error, settings: undefined };
        }
    }

    public async chatInputRequest(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const modal = new ModalBuilder().setCustomId(VerifyRequestModal.Id).setTitle("Verification");
        const nameInput = new TextInputBuilder().setCustomId(VerifyRequestModal.NameInput).setLabel("Name").setStyle(TextInputStyle.Paragraph);
        const teamInput = new TextInputBuilder().setCustomId(VerifyRequestModal.TeamInput).setLabel("Team").setStyle(TextInputStyle.Short);
        modal.addComponents(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nameInput), new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(teamInput));

        await inter.showModal(modal);
    }

    public async chatInputList(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings === undefined) {
            logger.info("Verification must be enabled first.");
            return;
        }

        const users = await this.db.query.verifyEntry.findMany({
            where: eq(verifyEntry.gid, inter.guildId)
        });

        if (users.length === 0) {
            logger.info("No pending verifications.");
            return;
        }

        const template = new EmbedBuilder().setColor("Greyple");
        new PaginatedFieldMessageEmbed<VerifyUser>()
            .setTitleField("Verification List")
            .setTemplate(template)
            .setItems(users)
            .formatItems((user) => `${user.nick} •︎ ${userMention(user.uid)}`)
            .setActions([
                {
                    customId: "@leekbot/previous",
                    style: ButtonStyle.Primary,
                    emoji: emojis.LeftArrow,
                    type: ComponentType.Button,
                    run: ({ handler }) => {
                        if (handler.index === 0) {
                            handler.index = handler.pages.length - 1;
                        } else {
                            --handler.index;
                        }
                    }
                },
                {
                    customId: "@leekbot/next",
                    style: ButtonStyle.Primary,
                    emoji: emojis.RightArrow,
                    type: ComponentType.Button,
                    run: ({ handler }) => {
                        if (handler.index === handler.pages.length - 1) {
                            handler.index = 0;
                        } else {
                            ++handler.index;
                        }
                    }
                },
                {
                    customId: "@leekbot/submit",
                    style: ButtonStyle.Primary,
                    emoji: emojis.Checkmark,
                    type: ComponentType.Button,
                    run: ({ collector, interaction }) => {
                        collector.stop();
                        this.onVerifySubmit(logger, settings, users, interaction as ButtonInteraction<"cached">);
                    }
                }
            ])
            .setItemsPerPage(5)
            .setIdle(30)
            .make()
            .run(inter);
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const channel = inter.options.getChannel("join_channel", true);
        const role = inter.options.getRole("role", true);
        const autogreet = inter.options.getBoolean("autogreet", false) ?? false;

        const { settings, error } = await this.getSettings(inter.guildId);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings) {
            logger.info("Verification is already enabled.");
            return;
        }

        try {
            await this.db.insert(verifySettings).values([
                {
                    gid: inter.guildId,
                    join_ch: channel.id,
                    roles: [role.id],
                    autogreet
                }
            ]);
            logger.info("Verification enabled.");
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
        if (settings === undefined) {
            logger.info("Verification must be enabled first.");
            return;
        }
        try {
            await this.db.delete(verifySettings).where(eq(verifySettings.gid, inter.guildId));
            logger.info("Verification disabled.");
        } catch (error) {
            logger.error("An error occurred while disabling verification.", error);
        }
    }

    public async chatInputAddRole(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const { settings, error } = await this.getSettings(inter.guildId);
        const role = inter.options.getRole("role", true);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings === undefined) {
            logger.info("Verification must be enabled first.");
            return;
        }

        const included = settings.roles.find((r) => r === role.id);
        if (included) {
            logger.info({
                interaction: `${role} is already included in the list of roles.`,
                logger: `${role.name} is already included in the list of roles.`
            });
            return;
        }

        try {
            await this.db
                .update(verifySettings)
                .set({ roles: arrayAppend(verifySettings.roles, role.id) })
                .where(eq(verifySettings.gid, inter.guildId));
            logger.info({
                interaction: `Added ${role} to verification roles.`,
                logger: `Added ${role.name} to verification roles.`
            });
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
    public async chatInputRemoveRole(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = this.getCommandLogger(inter);
        const { settings, error } = await this.getSettings(inter.guildId);
        const role = inter.options.getRole("role", true);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings === undefined) {
            logger.info("Verification must be enabled first.");
            return;
        }

        const included = settings.roles.find((r) => r === role.id);
        if (included) {
            logger.info({
                interaction: `${role} is already included in the list of roles.`,
                logger: `${role.name} is already included in the list of roles.`
            });
            return;
        }

        if (settings.roles.length === 1) {
            logger.info("Unable to remove role: a minimum of one role is required. Add more roles, then try again.");
            return;
        }

        try {
            await this.db
                .update(verifySettings)
                .set({ roles: arrayRemove(verifySettings.roles, role.id) })
                .where(eq(verifySettings.gid, inter.guildId));
            logger.info({
                interaction: `Removed ${role} from verification roles.`,
                logger: `Removed ${role.name} from verification roles.`
            });
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

    public async chatInputEdit(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const logger = this.getCommandLogger(inter);
        const { settings, error } = await this.getSettings(inter.guildId);
        const channel = inter.options.getChannel("join_channel", true);
        const autogreet = inter.options.getBoolean("autogreet", false);
        if (error) {
            logger.error("An error occurred while retrieving settings.", error);
            return;
        }
        if (settings === undefined) {
            logger.info("Verification must be enabled first.");
            return;
        }

        try {
            await this.db
                .update(verifySettings)
                .set({
                    join_ch: channel.id,
                    autogreet: autogreet ?? settings.autogreet
                })
                .where(eq(verifySettings.gid, inter.guildId));
            logger.info("Successfully updated verification settings.");
        } catch (error) {
            logger.error("An error occurred while editing your verification settings.", error);
        }
    }

    private async onVerifySubmit(logger: CommandLogger, settings: VerifySettings, users: VerifyUser[], inter: ButtonInteraction<"cached">) {
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
            response += `Failed to verify ${failedCount} ${pluralize("user", verified.length)}.`;
        }

        logger.info(response, undefined, { followUp: true });

        if (settings.autogreet && verified.length > 0) {
            const mentions = users
                .filter((u) => verified.find((v) => v.uid === u.uid))
                .map((u) => userMention(u.uid))
                .join(", ");

            const channel = (await inter.guild.channels.fetch(inter.channelId)) as TextChannel;
            channel.send(inlineCode(`Welcome ${mentions}!`));
        }
    }
}
