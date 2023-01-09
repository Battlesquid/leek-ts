import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Mark a channel as media only")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to mark as media only")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Un-mark a channel as media only")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to unmark")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    );

const add_exemption = new SlashCommandSubcommandBuilder()
    .setName("add_exempt")
    .setDescription("Allows a role to bypass media only channels")
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The role to exempt")
            .setRequired(true))

const remove_exemption = new SlashCommandSubcommandBuilder()
    .setName("remove_exempt")
    .setDescription("Removes a role from the exemption list for media only channels")
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true))

const mediaInteraction = new SlashCommandBuilder()
    .setName("mediaonly")
    .setDescription(
        "Marks a channel as media only (only links, videos, etc can be sent)"
    )
    .addSubcommand(enable)
    .addSubcommand(disable)
    .addSubcommand(add_exemption)
    .addSubcommand(remove_exemption);

export default mediaInteraction;
