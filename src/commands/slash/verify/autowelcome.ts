import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("autowelcome")
        .setDescription("Automatically generate a welcome message for verified users")
        .addBooleanOption(option =>
            option
                .setName("boolean")
                .setDescription("True to enable, false to disable")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {

    }
}