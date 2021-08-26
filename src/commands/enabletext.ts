import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("enabletext")
        .setDescription("Allows text to be sent in a channel.")
        .addChannelOption(option =>
            option
                .setName("target")
                .setDescription("The channel where you want to allow text.")
                .setRequired(true)
        )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    
}
