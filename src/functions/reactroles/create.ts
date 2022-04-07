import { ColorResolvable, CommandInteraction, MessageEmbed, Permissions } from "discord.js";
import { SlashCommandFunction } from "#types/CommandTypes";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "reactroles",
    subcommand: "create",
    perms: [Permissions.FLAGS.MANAGE_GUILD],
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const color = `#${
            inter.options.getString("color", false) ?? "444444"
        }` as ColorResolvable;
        const ch = inter.options.getChannel("channel", true);
        const name = inter.options.getString("name", true);
        const desc = inter.options.getString("desc", true);
        const msg = inter.options.getString("msg", false);

        if (!/^(?:#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})$/.test(color.toString())) {
            inter.reply("Invalid color, exiting.");
            return;
        }

        const reactEmbed = new MessageEmbed()
            .setTitle(name)
            .setDescription(desc)
            .setColor(color)
            .setFooter({ text: "reactroles" });

        const channel = await inter.guild?.channels.fetch(ch.id);
        if (!channel || channel.type !== "GUILD_TEXT") {
            inter.reply("Channel unavailable, please try again.");
            return;
        }

        channel.send({ content: msg, embeds: [reactEmbed] });

        inter.reply(`New react roles created in ${ch}.`);
    },
};

export default command;
