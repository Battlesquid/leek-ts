import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { ColorResolvable, CommandInteraction, MessageEmbed, TextChannel } from "discord.js"
import { LeekClient } from "../../../LeekClient";
import { Subcommand } from "../../../types/CommandTypes";

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create reaction-role group")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel to create the reaction-roles in.")
                .addChannelType(ChannelType.GuildText)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("The name of the react-role group")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("desc")
                .setDescription("The description for the react-role group")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("The color to set the react-role group to (e.g. FFFFFF)")
        )
        .addStringOption(option =>
            option
                .setName("msg")
                .setDescription("The message to prepend to the react-role group")
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const color = `#${inter.options.getString("color", false) ?? "444444"}` as ColorResolvable;
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
            .setFooter("reactroles")

        const channel = await inter.guild?.channels.fetch(ch.id);
        if (!channel || channel.type !== "GUILD_TEXT") {
            inter.reply("Channel unavailable, please try again.")
            return;
        }

        channel.send({ content: msg, embeds: [reactEmbed] })

        inter.reply(`New react roles created in ${ch}.`)
    }
}

export default command;