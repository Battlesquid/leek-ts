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

        try {
            const settings = await em.findOneOrFail(ChannelSettings, { gid: inter.guildId });
            if (!settings.media_only_chs.find(t => t === ch.id)) {
                inter.reply(`You must mark ${ch} as media only first.`)
                return;
            }
            settings.media_only_chs = settings.media_only_chs.filter(t => t !== ch.id);
            em.flush()

            inter.reply(`Unmarked ${ch} as media only.`)
        } catch (e) {
            inter.reply(`You must mark ${ch} as media only first.`)
            return;
        }
    }
}

export default command