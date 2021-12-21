import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Allow text in a channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to allow text in")
        ),
    execute: async (inter: CommandInteraction) => {

    }
}