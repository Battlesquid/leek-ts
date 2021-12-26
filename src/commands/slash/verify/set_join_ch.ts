import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_join_ch")
        .setDescription("Set the join channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel where new users join.")
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

        repo.update(settings, { join_ch: inter.options.getChannel("channel", true).id });

        inter.reply(`Join channel set to ${inter.options.getChannel("channel", true)}`)
    }
}

export default command;