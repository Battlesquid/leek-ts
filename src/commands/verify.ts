import { verifyInteraction } from '@interactions';
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { verifyModal } from '@modals';

export class VerifyCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'verify',
            subcommands: [
                {
                    name: 'list',
                    chatInputRun: 'chatInputList',
                },
                {
                    name: 'enable',
                    chatInputRun: 'chatInputEnable'
                },
                {
                    name: 'disable',
                    chatInputRun: 'chatInputDisable'
                },
                {
                    name: 'add_role',
                    chatInputRun: 'chatInputAddRole'
                },
                {
                    name: 'remove_role',
                    chatInputRun: 'chatInputRemoveRole'
                },
                {
                    name: 'edit',
                    chatInputRun: 'chatInputEdit'
                },
                {
                    name: 'request',
                    chatInputRun: 'chatInputRequest'
                }
            ]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(verifyInteraction, {
            idHints: ["919820845126385737"]
        })
    }

    private async getSettings(guildId: string) {
        return container.prisma.verify_settings.findFirst({
            where: { gid: guildId }
        });
    }

    public async chatInputRequest(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        await inter.showModal(verifyModal.modal);
    }

    public async chatInputList(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const { prisma } = container;
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const pendingList = await prisma.verify_entry.findMany({
            where: {
                gid: inter.guildId
            }
        });

        if (pendingList?.length === 0) {
            inter.reply("No pending verifications.");
            return;
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
        container.prisma.verify_settings.create({
            data: {
                gid: inter.guildId,
                autogreet,
                roles: [role.id],
                join_ch: join_ch.id
            }
        })
            .then(() => inter.reply("Verification enabled."))
            .catch((e) => {
                inter.reply("An error occured, please try again later.")
                container.logger.error(e);
            })

    }
    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        container.prisma.verify_settings.delete({ where: { gid: inter.guildId ?? undefined } })
            .then(() => inter.reply("Verification disabled."))
            .catch((e) => {
                inter.reply("An error occured, please try again later.")
                container.logger.error(e);
            })
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

        container.prisma.verify_settings.update({
            where: {
                gid: inter.guildId ?? undefined
            },
            data: {
                roles: { push: role.id }
            }
        })
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
            inter.reply(
                `Unable to remove role: a minimum of one role is required. Add more roles, then try again.`
            );
            return;
        }

        container.prisma.verify_settings.update({
            where: {
                gid: inter.guildId
            },
            data: {
                roles: { set: settings.roles.filter((r) => r !== role.id) }
            }
        })

        await container.prisma.$transaction([
            container.prisma.$executeRaw`UPDATE verify_settings SET roles=(array_remove(column, ${role.id})) WHERE ${role.id} = ANY(column_name)`
        ])
    }

    public async chatInputEdit(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const settings = await this.getSettings(inter.guildId);
        if (settings === null) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const join_ch = inter.options.getChannel("join_channel", true);
        const autogreet = inter.options.getBoolean("autogreet", false) ?? false;
        container.prisma.verify_settings.update({
            where: {
                gid: inter.guildId ?? undefined
            },
            data: {
                join_ch: join_ch.id,
                autogreet
            }
        })
            .then(() => inter.reply("Successfully updated verification settings."))
            .catch((e) => {
                container.logger.error(e);
                inter.reply("An error occured, please try again later.");
            })
    }
}