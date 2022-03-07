import { CommandInteraction } from "discord.js"
import { SlashCommandFunction } from "types/CommandTypes"
import ChannelSettings from "../../entities/ChannelSettings"
import LeekClient from "../../LeekClient"

const command: SlashCommandFunction = {
    name: "mediaonly",
    subcommand: "disable",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true);

        const em = client.orm.em.fork();
        const settings = await em.findOne(ChannelSettings, { gid: inter.guildId });

        if (settings) {
            if (!settings.media_only_chs.find(t => t === ch.id)) {
                inter.reply(`You must mark ${ch} as media only first.`)
                return;
            }
            settings.media_only_chs = settings.media_only_chs.filter(t => t !== ch.id);
            em.flush()
        } else {
            inter.reply(`You must mark ${ch} as media only first.`)
            return;
        }

        inter.reply(`Unmarked ${ch} as media only.`)
    }
}

export default command