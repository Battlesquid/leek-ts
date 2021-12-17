import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js"

export const structure =
    new SlashCommandBuilder()
        .setName("logging")
        .setDescription("Manage server wide message logging.")
        .addSubcommand(subcmd =>
            subcmd
                .setName("enable")
                .setDescription("Enable server wide message logging")
        )
        .addSubcommand(subcmd =>
            subcmd
                .setName("disable")
                .setDescription("Disable message logging")
        )

const enable = (interaction: Interaction) => {
    
}

const disable = (interaction: Interaction) => {

}

export const execute = async(interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.options.getSubcommand() === "enable")
        enable(interaction)
    else disable(interaction)
}
