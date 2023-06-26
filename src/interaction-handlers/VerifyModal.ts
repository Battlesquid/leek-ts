import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import type { ModalSubmitInteraction } from 'discord.js';
import { verifyModal } from '@modals';

export class VerifyModalHandler extends InteractionHandler {
  public constructor(ctx: PieceContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.ModalSubmit
    });
  }

  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== verifyModal.schema.id) {
      return this.none();
    }
    return this.some();
  }

  public async run(inter: ModalSubmitInteraction<"cached" | "raw">) {
    const settings = await this.container.prisma.verify_settings.findFirst({
      where: {
        gid: inter.guildId
      }
    });

    if (settings === null || inter.channelId !== settings.join_ch) {
      return;
    }

    const name = inter.fields.getTextInputValue(verifyModal.schema.inputs.name.customId);
    const team = inter.fields.getTextInputValue(verifyModal.schema.inputs.team.customId);
    const nick = `${name} | ${team}`;

    await this.container.prisma.verify_entry.upsert({
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
      content: 'Your verification request was sent.',
      ephemeral: true
    });
  }
}