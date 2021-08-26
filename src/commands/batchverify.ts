import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("batchverify")
        .setDescription("Puts users on a waitlist to enter the server.")
        .addChannelOption(option =>
            option
                .setName("User Join Channel")
                .setDescription("The channel where users will show up")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("Approval Channel")
                .setDescription("The channel where admins will approve users on the waitlist.")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("Role")
                .setDescription("The role to give the user when they are approved.")
                .setRequired(true)
        )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

}
