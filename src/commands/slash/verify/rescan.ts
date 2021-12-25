import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("rescan")
        .setDescription("Rescans the user join channel for new users"),

    execute: async (client: LeekClient, inter: CommandInteraction) => {

    }
}

export default command;