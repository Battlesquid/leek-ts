import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { LeekClient } from "../../../../LeekClient"
import { Subcommand } from "../../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Allow text in a channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to allow text in")
        ),
    execute: async (client: LeekClient, inter: CommandInteraction) => {

    }
}

export default command;