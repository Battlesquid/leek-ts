import { Events, Listener, type ChatInputCommandDeniedPayload, type UserError } from "@sapphire/framework";

export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
    public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
        console.log("hi");
        if (interaction.deferred || interaction.replied) {
            return interaction.editReply({
                content: error.message
            });
        }

        return interaction.reply({
            content: error.message,
            ephemeral: true
        });
    }
}
