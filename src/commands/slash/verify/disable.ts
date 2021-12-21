import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"


export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable verification"),

    execute: async (inter: CommandInteraction) => {

    }
}