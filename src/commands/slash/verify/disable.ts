import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"


const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable verification"),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(VerifySettings);
        const settings = repo.findOne({ gid: inter.guildId })
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        repo.delete({ gid: inter.guildId })
        inter.reply("Verification disabled.")
    }
}

export default command;