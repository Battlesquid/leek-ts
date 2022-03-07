import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const mediaInteraction = new SlashCommandBuilder()
    .setName("mediaonly")
    .setDescription("Marks a channel as media only (only links, videos, etc can be sent)")
    .addSubcommand(subcmd =>
        subcmd
            .setName("enable")
            .setDescription("Mark a channel as media only")
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("The channel to mark as media only")
                    .addChannelType(ChannelType.GuildText)
                    .setRequired(true)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("disable")
            .setDescription("Un-mark a channel as media only")
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("The channel to unmark")
                    .addChannelType(ChannelType.GuildText)
                    .setRequired(true)
            )
    )

export default mediaInteraction;