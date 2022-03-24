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

const mediaInteraction = new SlashCommandBuilder()
    .setName("mediaonly")
    .setDescription(
        "Marks a channel as media only (only links, videos, etc can be sent)"
    )
    .setDefaultPermission(false)
    .addSubcommand(enable)
    .addSubcommand(disable);

export default mediaInteraction;
