import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"
import { Command } from "../types";

export const structure = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Puts users on a waitlist to enter the server.")
    .addChannelOption(option =>
        option
            .setName("new_user_channel")
            .setDescription("Where new users join")
            .setRequired(true)
    )
    .addChannelOption(option =>
        option
            .setName("approval_channel")
            .setDescription("Where staff will approve users.")
            .setRequired(true)
    )
    .addRoleOption(option =>
        option
            .setName("role")
            .setDescription("Roles to give on approval")
            .setRequired(true)
    )

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

};