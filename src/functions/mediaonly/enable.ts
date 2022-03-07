import { CommandInteraction } from "discord.js"
import { SlashCommandFunction } from "types/CommandTypes"
import ChannelSettings from "entities/ChannelSettings"
import LeekClient from "../../LeekClient"

const command: SlashCommandFunction = {
    name: "mediaonly",
    subcommand: "enable",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        if (!inter.guildId) {
            inter.reply("An unexpected error occured")
            return;
        }
        
        const ch = inter.options.getChannel("channel", true);

        const em = client.orm.em.fork();

        let settings;

        try {
            settings = await em.findOneOrFail(ChannelSettings, { gid: inter.guildId });
            if (settings.media_only_chs.find(t => t === ch.id)) {
                inter.reply(`${ch} is already marked as media only.`);
                return;
            }
            settings.media_only_chs.push(ch.id);
            em.flush();
        } catch (e) {
            settings = new ChannelSettings(inter.guildId, [ch.id])
            em.persistAndFlush(settings);
        }

        inter.reply(`Marked ${ch} as media only.`)
    }
}

export default command;