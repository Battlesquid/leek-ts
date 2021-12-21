import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("add_role")
        .setDescription("Add a role to a group")
        .addStringOption(option =>
            option
                .setName("group")
                .setDescription("The react-role group to modify")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("The role to give on react")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("emoji")
                .setDescription("The emoji to represent this role")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}