import { CommandInteraction } from "discord.js"
import { SlashCommandFunction } from "types/CommandTypes"
import LogSettings from "entities/LogSettings"
import LeekClient from "../../LeekClient"


const command: SlashCommandFunction = {
    name: "logs",
    subcommand: "enable",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        if (!inter.guildId) {
            inter.reply("An unexpected error occured.");
            return;
        }
        const ch = inter.options.getChannel("channel", true);
        const type = inter.options.getString("type", true);
        const em = client.orm.em.fork();

        let settings = await em.findOne(LogSettings, { gid: inter.guildId });

        // if settings doesnt exist
        if (!settings) {
            if (type === "text") {
                settings = new LogSettings(inter.guildId, ch.id, null);
            } else {
                settings = new LogSettings(inter.guildId, null, ch.id);
            }
            em.persistAndFlush(settings);
        } else { // means that i_log_ch exists and we dont want to override it
            if (type === "text") {
                settings.t_log_ch = ch.id
            } else {
                settings.i_log_ch = ch.id;
            }
            em.flush();
        }
        console.log(settings);

        inter.reply("Enabled text logging.");
    }
}

export default command;