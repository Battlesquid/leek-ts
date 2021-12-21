import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"


export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Enable server wide message logging"),

    execute: async (inter: CommandInteraction) => {
        inter.reply("Enabled server-wide logging.")
    }
}