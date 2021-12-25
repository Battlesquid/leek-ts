import { SlashCommandSubcommandGroupBuilder } from "@discordjs/builders"

export default {
    structure: new SlashCommandSubcommandGroupBuilder()
        .setName("image")
        .setDescription("Image logging commands")
}