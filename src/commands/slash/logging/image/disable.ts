import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getRepository } from "typeorm";
import LogSettings from "../../../../database/entities/LogSettings";
import { LeekClient } from "../../../../LeekClient";
import { Subcommand } from "../../../../types/CommandTypes";

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable image logging"),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(LogSettings);
        const settings = await repo.findOne({ gid: inter.guildId });

        // if there isn't text log channel (assumes settings exist)
        if (!settings?.i_log_ch) {
            inter.reply("Image logging must be enabled first.");
            return;
        }

        if (!settings.i_log_ch) {
            repo.delete({ gid: inter.guildId })
        } else if (settings) {
            repo.update(settings, { i_log_ch: null });
        }

        inter.reply("Disabled image logging.")
    }
}

export default command;