import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

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

const enable = (inter: CommandInteraction) => {

}

const disable = (inter: CommandInteraction) => {

}

export const execute = async (interaction: CommandInteraction) => {
    if (interaction.options.getSubcommand() === "enable")
        enable(interaction)
    else disable(interaction)
}
