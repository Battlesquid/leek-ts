import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable message logging"),

    execute: async (inter: CommandInteraction) => {
        inter.reply("Disabled server-wide logging.")
    }
}
