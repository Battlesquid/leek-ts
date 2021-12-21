import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("remove_role")
        .setDescription("Remove a role from a group")
        .addStringOption(option =>
            option
                .setName("group")
                .setDescription("The react-role group to modify")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("The role to remove")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}