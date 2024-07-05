import { VerifyRequestModal } from "../modals";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ModalSubmitInteraction } from "discord.js";

export class VerifyModalHandler extends InteractionHandler {
    public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.ModalSubmit
        });
    }

    public override parse(interaction: ModalSubmitInteraction) {
        if (interaction.customId !== VerifyRequestModal.Id) {
            return this.none();
        }
        return this.some();
    }

    public async run(inter: ModalSubmitInteraction<"cached" | "raw">) {
        const settings = await this.container.prisma.verifySettings.findFirst({
            where: {
                gid: inter.guildId
            }
        });

        if (settings === null || inter.channelId !== settings.join_ch) {
            inter.reply({
                content: "This server does not have self-verification enabled.",
                ephemeral: true
            });
            return;
        }

        const name = inter.fields.getTextInputValue(VerifyRequestModal.NameInput);
        const team = inter.fields.getTextInputValue(VerifyRequestModal.TeamInput);
        const nick = `${name} | ${team}`;

        await this.container.prisma.verifyEntry.upsert({
            create: {
                gid: inter.guildId,
                nick,
                uid: inter.user.id
            },
            update: { nick },
            where: {
                uid_gid: {
                    gid: inter.guildId,
                    uid: inter.user.id
                }
            }
        });

        inter.reply({
            content: "Your verification request was sent.",
            ephemeral: true
        });
    }
}
