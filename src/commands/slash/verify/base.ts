import { SlashCommandBuilder } from "@discordjs/builders"

export default {
    structure: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Allows server staff to approve users into the server")
}