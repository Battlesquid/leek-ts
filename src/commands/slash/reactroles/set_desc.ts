import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ApplicationCommandOptionType, ChannelType } from "discord-api-types"
import { CommandInteraction, TextChannel } from "discord.js"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types/CommandTypes"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("set_desc")
        .setDescription("Set the description for the react-role group")
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
                .setName("desc")
                .setDescription("The new description for the react-role group")
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const desc = inter.options.getString("desc", false);

        const messages = await ch.messages.fetch({ limit: 50 })
        const msg = messages.find(m => {
            if (!m.embeds.length) return false;
            if (m.embeds[0].title !== title) return false;
            if (!m.embeds[0].footer) return false;
            if (!m.embeds[0].footer.text.match("reactroles")) return false;
            if (!client.user) return false;
            if (!m.author.equals(client.user)) return false;
            return true;
        });
        if (!msg) {
            inter.reply("The requested react-roles are either too far back or does not exist.");
            return;
        }

        const embed = msg.embeds[0]
        embed.setDescription(desc ?? "")

        msg.edit({ embeds: [embed] });
        inter.reply(`Description for ${title} changed to "${desc}"`)
    }
}

export default command;

command.structure.toJSON().options![0].type === ApplicationCommandOptionType.Boolean