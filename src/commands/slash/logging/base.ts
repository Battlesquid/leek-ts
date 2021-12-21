import { SlashCommandBuilder } from "@discordjs/builders";

export default {
    structure: new SlashCommandBuilder()
        .setName("logging")
        .setDescription("Manage server wide message logging.")
}