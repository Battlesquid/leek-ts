import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType, PermissionFlagsBits } from "discord.js";

const create = new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create reaction-role group")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel to create the reaction-roles in.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("name")
            .setDescription("The name of the react-role group")
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("desc")
            .setDescription("The description for the react-role group")
    )
    .addStringOption((opt) =>
        opt
            .setName("color")
            .setDescription(
                "The color to set the react-role group to (e.g. FFFFFF)"
            )
    )
    .addStringOption((opt) =>
        opt
            .setName("msg")
            .setDescription("The message to prepend to the react-role group")
    );

const add_role = new SlashCommandSubcommandBuilder()
    .setName("add_role")
    .setDescription("Add a role to a group")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The title of the react-role to modify")
            .setRequired(true)
    )
    .addRoleOption((opt) =>
        opt
            .setName("role")
            .setDescription("The role to give on react")
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("emoji")
            .setDescription("The emoji to represent this role")
            .setRequired(true)
    );

const remove_role = new SlashCommandSubcommandBuilder()
    .setName("remove_role")
    .setDescription("Remove a role from a group")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel the react-roles are in")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    )
    .addRoleOption((opt) =>
        opt
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true)
    );

const edit = new SlashCommandSubcommandBuilder()
    .setName("edit")
    .setDescription("Edit reactroles")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    );

export const reactrolesInteraction = new SlashCommandBuilder()
    .setName("reactroles")
    .setDescription("Reaction-role commands")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(create)
    .addSubcommand(add_role)
    .addSubcommand(remove_role)
    .addSubcommand(edit)
