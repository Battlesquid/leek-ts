import { Interaction } from "discord.js"
import { SlashCommandBuilder } from "@discordjs/builders"

export const structure =
    new SlashCommandBuilder()
        .setName("logging")
        .setDescription("Manage server wide message logging.")
        .addSubcommand(subcmd =>
            subcmd
                .setName("enable")
                .setDescription("Enable server wide message logging")
                .addChannelOption(option =>
                    option
                        .setName("channel")
                        .setDescription("The channel to log messages to")))
        .addSubcommand(subcmd =>
            subcmd
                .setName("disable")
                .setDescription("Disable message logging"))

export const execute = (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

}
