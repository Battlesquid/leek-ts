import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    structure: new SlashCommandBuilder()
        .setName("channel")
        .setDescription("Sets whether text can be sent in a channel.")
}