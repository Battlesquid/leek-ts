import { SlashCommandBuilder } from "@discordjs/builders";

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
                    .setRequired(true)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("whitelist")
            .setDescription("Whitelist a role, allowing users with that role to bypass media-only restrictions")
            .addRoleOption(opt =>
                opt
                    .setName("role")
                    .setDescription("The role to whitelist")
                    .setRequired(true)
            )
    )

export default mediaInteraction;