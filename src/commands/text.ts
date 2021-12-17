import { SlashCommandBuilder } from "@discordjs/builders";
import { Interaction } from "discord.js";

export const structure =
    new SlashCommandBuilder()
        .setName("text")
        .setDescription("Allows text to be sent in a channel.")
        .addSubcommand(subcmd =>
            subcmd
                .setName("enable")
                .setDescription("Allow text in a channel")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to allow text in (defaults to current channel)")
                )
        )
        .addSubcommand(subcmd =>
            subcmd
                .setName("disable")
                .setDescription("Disable text")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to disable text in (defaults to current channel)")
                )
        )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

}
