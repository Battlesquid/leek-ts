import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const logsInteraction = new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Manage server wide message logging.")
    .addSubcommand(subcmd =>
        subcmd
            .setName("enable")
            .setDescription("Enable a type of log")
            .addStringOption(opt =>
                opt
                    .setName("type")
                    .setDescription("The type of log to enable")
                    .addChoices([["text", "text"], ["image", "image"]])
                    .setRequired(true)
            )
            .addChannelOption(opt =>
                opt
                    .setName("channel")
                    .setDescription("The channel to send these logs to")
                    .addChannelType(ChannelType.GuildText)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("disable")
            .setDescription("Disable image logging")
            .addStringOption(opt =>
                opt
                    .setName("type")
                    .setDescription("The type of log to disable")
                    .addChoices([["text", "text"], ["image", "image"]])
                    .setRequired(true)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("set_ch")
            .setDescription("Send a type of log to a given channel")
            .addStringOption(opt =>
                opt
                    .setName("type")
                    .setDescription("The type of log to target")
                    .addChoices([["text", "text"], ["image", "image"]])
                    .setRequired(true)
            )
            .addChannelOption(opt =>
                opt
                    .setName("channel")
                    .setDescription("The channel to send these logs to")
                    .addChannelType(ChannelType.GuildText)
            )
    )

export default logsInteraction;