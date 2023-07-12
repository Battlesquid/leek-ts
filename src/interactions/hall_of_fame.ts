import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ApplicationCommandType, ChannelType, ContextMenuCommandBuilder, PermissionFlagsBits } from "discord.js";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable hall of fame on a given channel.")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to enable.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Disable hall of fame on a given channel")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to disable")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

export const hallOfFameSlashCommand = new SlashCommandBuilder()
    .setName("hall_of_fame")
    .setDescription(
        "For recording noteworthy server content."
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(enable)
    .addSubcommand(disable);

export const hallOfFameContextCommand = new ContextMenuCommandBuilder()
    .setName("Add to Hall of Fame")
    .setType(ApplicationCommandType.Message);

export enum HallOfFameIds {
    SELECT = "hall-of-fame-select"
}