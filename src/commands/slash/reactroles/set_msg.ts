import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction, TextChannel } from "discord.js"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_msg")
        .setDescription("Set the prepended message for the react-role")
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
                .setName("msg")
                .setDescription("The new message to give to the react-role")
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const msgContent = inter.options.getString("msg", false) ?? "";

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

        if (msgContent === "") {
            msg.edit({ content: null });
            inter.reply(`Removed message from ${title}`);
        } else {
            msg.edit(msgContent);
            inter.reply(`Updated ${title}'s message to ${msgContent}`);
        }
    }
}

export default command;