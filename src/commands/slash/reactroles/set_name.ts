import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_name")
        .setDescription("Set the name for a react-role group")
        .addStringOption(option =>
            option
                .setName("group")
                .setDescription("The react-role group to modify")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("The new name for the react-role group")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}