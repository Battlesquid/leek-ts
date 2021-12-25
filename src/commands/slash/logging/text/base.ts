import { SlashCommandSubcommandGroupBuilder } from "@discordjs/builders"

export default {
    structure: new SlashCommandSubcommandGroupBuilder()
        .setName("text")
        .setDescription("Text logging settings")
}