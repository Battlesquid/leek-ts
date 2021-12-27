import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import ChannelSettings from "../../../database/entities/ChannelSettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Mark a channel as media only")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to mark as media only")
                .setRequired(true)
        ),
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true);
        const repo = getRepository(ChannelSettings);
        let settings;

        try {
            settings = await repo.findOneOrFail({ gid: inter.guildId });
            if (settings.media_only_chs.find(t => t === ch.id)) {
                inter.reply(`${ch} is already marked as media only.`);
                return;
            }
            settings.media_only_chs.push(ch.id);
        } catch (e) {
            settings = repo.create({
                gid: inter.guildId,
                media_only_chs: [ch.id]
            })
        }

        repo.save(settings)
        inter.reply(`Marked ${ch} as media only.`)
    }
}

export default command;