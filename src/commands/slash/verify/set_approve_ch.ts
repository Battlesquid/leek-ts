import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_appove_ch")
        .setDescription("Set the approve channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel where daily verification lists will be sent to.")
                .addChannelType(ChannelType.GuildText)
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(VerifySettings)
        const settings = await repo.findOne({ gid: inter.guildId })
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        repo.update(settings, { appr_ch: inter.options.getChannel("channel", true).id })

        inter.reply(`Join channel set to ${inter.options.getChannel("channel", true)}`)
    }
}

export default command;