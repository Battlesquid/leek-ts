import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { ColorResolvable, CommandInteraction, TextChannel } from "discord.js"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_color")
        .setDescription("Set the color for the react-role group")
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
                .setName("color")
                .setDescription("The color to set the react-role group to (e.g. #FFFFFF)")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const color = `#${inter.options.getString("color", true)}` as ColorResolvable;

        if (!/#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}/.test(color.toString())) {
            inter.reply("Invalid color, exiting.");
            return;
        }

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
        embed.setColor(color);

        msg.edit({ embeds: [embed] });
        inter.reply(`${title}'s color has been set to #${color}.`);
    }
}

export default command;