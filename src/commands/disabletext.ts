import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("disabletext")
        .setDescription("Blocks text from being sent in a channel.")
        .addChannelOption(option =>
            option
                .setName("target")
                .setDescription("The channel where you want to block text.")
                .setRequired(true)
        )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    
}
