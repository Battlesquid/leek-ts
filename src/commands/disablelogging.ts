import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("disablelogging")
        .setDescription("Disables message logging")

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    
}
