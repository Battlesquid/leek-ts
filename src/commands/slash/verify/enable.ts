import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Enable new member verification")
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
                .setDescription("Role to give on approval")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}