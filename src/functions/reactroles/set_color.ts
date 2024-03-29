import { SlashCommandFunction } from "#types/CommandTypes";
import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionsBitField, TextChannel } from "discord.js";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "reactroles",
    subcommand: "set_color",
    perms: [PermissionsBitField.Flags.ManageGuild],
    execute: async (client: LeekClient, inter: ChatInputCommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const color = `#${inter.options.getString(
            "color",
            true
        )}` as ColorResolvable;

        if (!/^(?:#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})$/.test(color.toString())) {
            inter.reply("Invalid color, exiting.");
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

        const embed = EmbedBuilder.from(msg.embeds[0]);
        embed.setColor(color);

        msg.edit({ embeds: [embed] });
        inter.reply(`${title}'s color has been set to ${color}.`);
    },
};

export default command;
