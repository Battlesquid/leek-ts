import { CommandInteraction } from "discord.js";
import LogSettings from "entities/LogSettings";
import { SlashCommandFunction } from "types/CommandTypes";
import LeekClient from "../../LeekClient";

const command: SlashCommandFunction = {
    name: "logs",
    subcommand: "disable",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const type = inter.options.getString("type", true);

        const em = client.orm.em.fork();
        const settings = await em.findOne(LogSettings, { gid: inter.guildId });

        if (!settings) {
            inter.reply("Logging must be enabled first.");
            return;
        }

        if (type === "text") {
            if (!settings.t_log_ch) {
                inter.reply("Text logging must be enabled first.");
                return;
            } else {
                if (!settings.i_log_ch) {
                    em.removeAndFlush(settings);
                } else {
                    settings.t_log_ch = null;
                    em.flush();
                }
            }
        }

        if (type === "image") {
            if (!settings.i_log_ch) {
                inter.reply("Image logging must be enabled first.");
                return;
            } else {
                if (!settings.t_log_ch) {
                    em.removeAndFlush(settings);
                } else {
                    settings.i_log_ch = null;
                    em.flush();
                }
            }
        }

        inter.reply(`Disabled ${type} logging.`);
    },
};

export default command;
