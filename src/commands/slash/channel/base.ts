import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    structure: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("Allows text to be sent in a channel.")
}