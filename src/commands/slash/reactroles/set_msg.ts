import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_msg")
        .setDescription("Set the prepended message for the react-role group")
        .addStringOption(option =>
            option
                .setName("group")
                .setDescription("The react-role group to modify")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("msg")
                .setDescription("The new message to give to the react-role group")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}