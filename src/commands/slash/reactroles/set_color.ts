import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_color")
        .setDescription("Set the color for the react-role group")
        .addStringOption(option =>
            option
                .setName("group")
                .setDescription("The react-role group to modify")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("The color to set the react-role group to (e.g. #FFFFFF)")
        ),

    execute: async (inter: CommandInteraction) => {

    }
}