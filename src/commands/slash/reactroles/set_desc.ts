import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_desc")
        .setDescription("Set the description for the react-role group")
        .addStringOption(option =>
            option
                .setName("group")
                .setDescription("The react-role group to modify")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("desc")
                .setDescription("The new description for the react-role group")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}