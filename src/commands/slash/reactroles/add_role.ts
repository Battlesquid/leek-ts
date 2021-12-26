import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction, Formatters, TextChannel, User } from "discord.js"
import { LeekClient } from "../../../LeekClient";
import twemoji from "twemoji"
import { patterns } from "../../../util/regexes";
import { Subcommand } from "../../../types/CommandTypes";

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("add_role")
        .setDescription("Add a role to a group")
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
                .setDescription("The title of the react-role to modify")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("The role to give on react")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("emoji")
                .setDescription("The emoji to represent this role")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const role = inter.options.getRole("role", true);
        const emoji = inter.options.getString("emoji", true);

        if (!(twemoji.test(emoji) || patterns.EMOJI_REGEX.test(emoji))) {
            inter.reply("Malformed emoji, exiting");
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
        });
        if (!msg) {
            inter.reply("The requested react-roles are either too far back or does not exist.");
            return;
        }

        const embed = msg.embeds[0];

        if (embed.fields.find(f => f.name === emoji)) {
            inter.reply("Emoji already in use, exiting.");
            return;
        }

        if (embed.fields.find(f => f.value === Formatters.roleMention(role.id))) {
            inter.reply("Role already included, exiting.");
            return;
        }

        embed.addField(emoji, Formatters.roleMention(role.id), true);
        msg.edit({ embeds: [embed] });
        msg.react(emoji);

        inter.reply(`Users can now react to ${title} with ${emoji} to get the ${role} role`);
    }
}

export default command;