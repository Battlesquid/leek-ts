import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable a type of log")
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of log to enable")
            .addChoices([
                ["text", "text"],
                ["image", "image"],
            ])
            .setRequired(true)
    )
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel to send these logs to")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Disable image logging")
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of log to disable")
            .addChoices([
                ["text", "text"],
                ["image", "image"],
            ])
            .setRequired(true)
    );

const logsInteraction = new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Manage server wide message logging.")
    .setDefaultPermission(false)
    .addSubcommand(enable)
    .addSubcommand(disable);

export default logsInteraction;
