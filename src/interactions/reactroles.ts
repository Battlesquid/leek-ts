import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const create = new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create reaction-role group")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel to create the reaction-roles in.")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("name")
            .setDescription("The name of the react-role group")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("desc")
            .setDescription("The description for the react-role group")
    )
    .addStringOption(opt =>
        opt
            .setName("color")
            .setDescription("The color to set the react-role group to (e.g. FFFFFF)")
    )
    .addStringOption(opt =>
        opt
            .setName("msg")
            .setDescription("The message to prepend to the react-role group")
    )

const add_role = new SlashCommandSubcommandBuilder()
    .setName("add_role")
    .setDescription("Add a role to a group")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("title")
            .setDescription("The title of the react-role to modify")
            .setRequired(true)
    )
    .addRoleOption(opt =>
        opt
            .setName("role")
            .setDescription("The role to give on react")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("emoji")
            .setDescription("The emoji to represent this role")
            .setRequired(true)
    )

const delete_role = new SlashCommandSubcommandBuilder()
    .setName("delete_role")
    .setDescription("Remove a role from a group")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel the react-roles are in")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    )
    .addRoleOption(opt =>
        opt
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true)
    )

const set_color = new SlashCommandSubcommandBuilder()
    .setName("set_color")
    .setDescription("Set the color for the react-role group")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("color")
            .setDescription("The color to set the react-role group to (e.g. #FFFFFF)")
            .setRequired(true)
    )

const set_desc = new SlashCommandSubcommandBuilder()
    .setName("set_desc")
    .setDescription("Set the description for the react-role group")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("desc")
            .setDescription("The new description for the react-role group")
    )

const set_msg = new SlashCommandSubcommandBuilder()
    .setName("set_msg")
    .setDescription("Set the prepended message for the react-role")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("msg")
            .setDescription("The new message to give to the react-role")
    )

const set_name = new SlashCommandSubcommandBuilder()
    .setName("set_name")
    .setDescription("Set the name for a react-role")
    .addChannelOption(opt =>
        opt
            .setName("channel")
            .setDescription("The channel where the react-role is")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("title")
            .setDescription("The react-role to modify")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("new_title")
            .setDescription("The new title for the react-role group")
            .setRequired(true)
    )

const reactrolesInteraction = new SlashCommandBuilder()
    .setName("reactroles")
    .setDescription("Reaction-role commands")
    .setDefaultPermission(false)
    .addSubcommand(create)
    .addSubcommand(add_role)
    .addSubcommand(delete_role)
    .addSubcommand(set_color)
    .addSubcommand(set_desc)
    .addSubcommand(set_msg)
    .addSubcommand(set_name)

export default reactrolesInteraction;