import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("text")
        .setDescription("Allows text to be sent in a channel.")
        .addSubcommand(subcmd =>
            subcmd
                .setName("enable")
                .setDescription("Allow text")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to allow text in")))
        .addSubcommand(subcmd =>
            subcmd
                .setName("disable")
                .setDescription("Disable text")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to disable text in")))

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

}
