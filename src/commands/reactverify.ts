import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("reactverify")
        .setDescription("Allows new users to be allowed into a server via a reaction.")
        .addChannelOption(option =>
            option
                .setName("Reaction Channel")
                .setDescription("The channel where you want the reaction to show up.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("Message")
                .setDescription("The message you would like the reaction to be attached to.")
        )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

}
