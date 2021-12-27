import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    structure: new SlashCommandBuilder()
        .setName("mediaonly")
        .setDescription("Marks a channel as media only (only links, videos, etc can be sent)")
}