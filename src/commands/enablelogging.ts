import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("enablelogging")
        .setDescription("Enables server wide message logging.")
        .addChannelOption(option =>
            option
                .setName("Logging Channel")
                .setDescription("The channel where you want logs to be sent.")
                .setRequired(true)
        )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    
}
