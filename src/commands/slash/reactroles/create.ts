import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create reaction-role group")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel to create the reaction-roles in.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("The name of the react-role group")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("desc")
                .setDescription("The description for the react-role group")
        )
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("The color to set the react-role group to (e.g. #FFFFFF)")
        )
        .addStringOption(option =>
            option
                .setName("msg")
                .setDescription("The message to prepend to the react-role group")
        ),

    execute: async (inter: CommandInteraction) => {

    }
}