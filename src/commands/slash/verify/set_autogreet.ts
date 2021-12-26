import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_autogreet")
        .setDescription("Automatically generate a welcome message for verified users")
        .addBooleanOption(option =>
            option
                .setName("autogreet")
                .setDescription("True to enable, false to disable")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(VerifySettings)
        const settings = await repo.findOne({ gid: inter.guildId })
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        settings.autogreet = inter.options.getBoolean("autogreet", true)
        repo.save(settings);

        inter.reply(`Autogreet set to ${inter.options.getBoolean("autogreet", true)}`)
    }
}

export default command;