import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import { getRepository } from "typeorm"
import VerifyList from "../../../database/entities/VerifyLists"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("Display verification list"),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(VerifyList);
        const vList = await repo.findOne({ gid: inter.guildId });
        if (!vList) {
            inter.reply("No pending verifications.");
            return;
        }

        const vEmbed = new MessageEmbed()
            .setTitle("Pending Verifications")
            .setDescription(`List as of ${new Date()}`);

        for (const entry of vList.list) {
            vEmbed.addField(entry.nick, `<@${entry.id}>`)
        }

        inter.reply({ embeds: [vEmbed] })
    }
}

export default command;