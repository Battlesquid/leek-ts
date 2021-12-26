import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction, Formatters, TextChannel } from "discord.js"
import { LeekClient } from "../../../LeekClient";
import { Subcommand } from "../../../types/CommandTypes";
import { patterns, indices } from "../../../util/regexes";

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("remove_role")
        .setDescription("Remove a role from a group")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel the react-roles are in")
                .addChannelType(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("The react-role to modify")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("The role to remove")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const role = inter.options.getRole("role", true);

        const messages = await ch.messages.fetch({ limit: 50 });
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

        // verify that the role exists
        const roleField = embed.fields.find(f => f.value === Formatters.roleMention(role.id));
        if (!roleField) {
            inter.reply(`${role} does not exist on ${title}`);
            return;
        }

        // filter out the field we want to remove
        const fields = embed.fields.filter(f => f.value !== Formatters.roleMention(role.id));
        embed.fields = fields;
        msg.edit({ embeds: [embed] });

        // resolve the emoji, fetch the reaction and remove it
        const emojiMatch = roleField.name.match(patterns.EMOJI_REGEX);
        const emoji = emojiMatch ? emojiMatch[indices.EMOJI_ID] : roleField.name;
        msg.reactions.cache.get(emoji)?.remove();

        inter.reply(`Removed ${role} from ${title}`);
    }
}

export default command;