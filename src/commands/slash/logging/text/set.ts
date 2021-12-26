import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import LogSettings from "../../../../database/entities/LogSettings"
import { LeekClient } from "../../../../LeekClient"
import { Subcommand } from "../../../../types/CommandTypes"


const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set")
        .setDescription("Set a text log channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to send text logs to")
                .setRequired(true)
                .addChannelType(ChannelType.GuildText)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true);

        const repo = getRepository(LogSettings);
        let settings = await repo.findOne({ gid: inter.guildId });

        // if settings doesnt exist
        if (!settings) {
            settings = repo.create({
                gid: inter.guildId,
                i_log_ch: null,
                t_log_ch: ch.id
            });
        } else { // means that i_log_ch exists and we dont want to override it
            settings.t_log_ch = ch.id
        }

        repo.save(settings);
        inter.reply("Enabled text logging.");
    }
}

export default command;