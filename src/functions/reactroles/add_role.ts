import { SlashCommandFunction } from "#types/CommandTypes";
import { patterns } from "#util/regexes";
import { ChatInputCommandInteraction, roleMention, PermissionsBitField, TextChannel, EmbedBuilder } from "discord.js";
import emojiRegex from "emoji-regex";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "reactroles",
    subcommand: "add_role",
    perms: [PermissionsBitField.Flags.ManageGuild],
    execute: async (client: LeekClient, inter: ChatInputCommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const role = inter.options.getRole("role", true);
        const emoji = inter.options.getString("emoji", true);

        if (!(emojiRegex().test(emoji) || patterns.EMOJI_REGEX.test(emoji))) {
            inter.reply("Malformed emoji, exiting");
            return;
        }

        const messages = await ch.messages.fetch({ limit: 50 });
        const msg = messages.find((m) => {
            if (!m.embeds.length) return false;
            if (m.embeds[0].title !== title) return false;
            if (!m.embeds[0].footer) return false;
            if (!m.embeds[0].footer.text.match("reactroles")) return false;
            if (!client.user) return false;
            if (!m.author.equals(client.user)) return false;
            return true;
        });
        if (!msg) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }

        const embed = msg.embeds[0];

        if (embed.fields.find((f) => f.name === emoji)) {
            inter.reply("Emoji already in use, exiting.");
            return;
        }

        if (
            embed.fields.find(
                (f) => f.value === roleMention(role.id)
            )
        ) {
            inter.reply("Role already included, exiting.");
            return;
        }

        const builder = EmbedBuilder.from(embed);
        builder.addFields([{ name: emoji, value: roleMention(role.id), inline: true }]);
        msg.edit({ embeds: [embed] });
        msg.react(emoji);

        inter.reply(
            `Users can now react to ${title} with ${emoji} to get the ${role} role`
        );
    },
};

export default command;
