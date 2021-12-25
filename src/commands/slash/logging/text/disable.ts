import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm";
import LogSettings from "../../../../database/entities/LogSettings";
import { LeekClient } from "../../../../LeekClient";
import { Subcommand } from "../../../../types";

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable text logging"),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(LogSettings);
        const settings = await repo.findOne({ gid: inter.guildId });

        // if there isn't text log channel (assumes settings exist)
        if (!settings?.t_log_ch) {
            inter.reply("Text logging must be enabled first.");
            return;
        }

        if (!settings.i_log_ch) {
            repo.delete({ gid: inter.guildId })
        } else if (settings) {
            repo.update(settings, { t_log_ch: null });
        }

        inter.reply("Disabled text logging.");
    }
}

export default command;