import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import ChannelSettings from "../../../../database/entities/ChannelSettings"
import { LeekClient } from "../../../../LeekClient"
import { Subcommand } from "../../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("disable")
        .setDescription("Disable text")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to disable text in")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true);
        const repo = getRepository(ChannelSettings);
        let settings;

        try {
            settings = await repo.findOneOrFail({ gid: inter.guildId });
            if (settings.txt_disabled.find(t => t === ch.id)) {
                inter.reply(`Text in ${ch} is already disabled.`);
                return;
            }
            settings.txt_disabled.push(ch.id);
        } catch (e) {
            settings = repo.create({
                gid: inter.guildId,
                txt_disabled: [ch.id]
            })
        }

        repo.save(settings)
        inter.reply(`Text can no longer be sent in ${ch}.`)
    }
}

export default command