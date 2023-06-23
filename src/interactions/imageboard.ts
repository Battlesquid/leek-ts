import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType, PermissionFlagsBits } from "discord.js";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable imageboards on a given chanel")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to mark as an imageboard")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Disable imageboards on a givenc hannel")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to disable imageboards on")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

const whitelist_add = new SlashCommandSubcommandBuilder()
    .setName("whitelist_add")
    .setDescription("Allows a role to bypass imageboards")
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The role to whitelist")
            .setRequired(true))

const whitelist_remove = new SlashCommandSubcommandBuilder()
    .setName("whitelist_remove")
    .setDescription("Removes a role from the whitelist for imageboards.")
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The role to remove from the whitelist")
            .setRequired(true))

export const imageboardInteraction = new SlashCommandBuilder()
    .setName("imageboard")
    .setDescription(
        "Marks a channel as an imageboard, where only links, videos, and other media can be sent."
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(enable)
    .addSubcommand(disable)
    .addSubcommand(whitelist_add)
    .addSubcommand(whitelist_remove);
