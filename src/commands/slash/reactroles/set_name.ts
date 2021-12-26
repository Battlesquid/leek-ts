import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types";
import { CommandInteraction, TextChannel } from "discord.js"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes";

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_name")
        .setDescription("Set the name for a react-role")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel where the react-role is")
                .addChannelType(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("The react-role to modify")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("new_title")
                .setDescription("The new title for the react-role group")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const newTitle = inter.options.getString("new_title", true);

        const messages = await ch.messages.fetch({ limit: 50 })
        const msg = messages.find(m => {
            if (!m.embeds.length) return false;
            if (m.embeds[0].title !== title) return false;
            if (!client.user) return false;
            if (!m.author.equals(client.user)) return false;
            // to-do, add filter to check if embed is role-react
            return true;
        })
        if (!msg) {
            inter.reply("The requested react-roles are either too far back or does not exist.");
            return;
        }

        const embed = msg.embeds[0];
        embed.setTitle(newTitle);
        msg.edit({ embeds: [embed] });

        inter.reply(`${title}'s name has been changed to ${newTitle}.`)
    }
}

export default command;