import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable text")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to disable text in")
        ),

    execute: async (inter: CommandInteraction) => {

    }
}