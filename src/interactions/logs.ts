import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType } from "discord.js";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable a type of log")
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of log to enable")
            .addChoices(
                { name: "text", value: "text" },
                { name: "image", value: "image" },
            )
            .setRequired(true)
    )
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel to send these logs to")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Disable image logging")
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of log to disable")
            .addChoices(
                { name: "text", value: "text" },
                { name: "image", value: "image" }
            )
            .setRequired(true)
    );

export const logsInteraction = new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Manage server wide message logging.")
    .addSubcommand(enable)
    .addSubcommand(disable);
