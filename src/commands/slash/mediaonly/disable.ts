import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import ChannelSettings from "../../../database/entities/ChannelSettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Un-mark a channel as media only")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to unmark")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true);

        const repo = getRepository(ChannelSettings);

        try {
            const settings = await repo.findOneOrFail({ gid: inter.guildId });
            if (!settings.media_only_chs.find(t => t === ch.id)) {
                inter.reply(`You must mark ${ch} as media only first.`)
                return;
            }
            settings.media_only_chs = settings.media_only_chs.filter(t => t !== ch.id)
            repo.save(settings);

            inter.reply(`Unmarked ${ch} as media only.`)
        } catch (e) {
            inter.reply(`You must mark ${ch} as media only first.`)
            return;
        }
    }
}

export default command