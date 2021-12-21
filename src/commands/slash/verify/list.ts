import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("Display verification list"),

    execute: async (inter: CommandInteraction) => {

    }
}