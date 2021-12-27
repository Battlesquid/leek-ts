import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import ChannelSettings from "../../../../database/entities/ChannelSettings"
import { LeekClient } from "../../../../LeekClient"
import { Subcommand } from "../../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Allow text in a channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to allow text in")
                .setRequired(true)
        ),
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true);

        const repo = getRepository(ChannelSettings);

        try {
            const settings = await repo.findOneOrFail({ gid: inter.guildId });
            if (!settings.txt_disabled.find(t => t === ch.id)) {
                inter.reply(`Text in ${ch} must be disabled first.`);
                return;
            }
            settings.txt_disabled = settings.txt_disabled.filter(t => t !== ch.id)
            repo.save(settings);

            inter.reply(`Text can now be sent in ${ch}.`)
        } catch (e) {
            inter.reply("You must first disable text in some channels first.")
            return;
        }
    }
}

export default command;