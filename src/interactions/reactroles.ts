import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType } from "discord.js";
import { CommandBundle } from ".";

const create = new SlashCommandSubcommandBuilder()
    .setName("create")
    .setDescription("Create a reactrole group")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel to create the reactroles in.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The title of the reactrole group")
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("desc")
            .setDescription("The description for the reactrole group")
    )
    .addStringOption((opt) =>
        opt
            .setName("color")
            .setDescription(
                "The color to set the reactrole group to (e.g. FFFFFF)"
            )
    )
    .addStringOption((opt) =>
        opt
            .setName("msg")
            .setDescription("The message to prepend to the reactrole group")
    );

const add_role = new SlashCommandSubcommandBuilder()
    .setName("add_role")
    .setDescription("Add a role to a group")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel containing the reactrole group")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The title of the react-role group to modify")
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
            .setDescription("The emoji to react to")
            .setRequired(true)
    );

const remove_role = new SlashCommandSubcommandBuilder()
    .setName("remove_role")
    .setDescription("Remove a role from a reactrole group")
    .addChannelOption((opt) =>
        opt
            .setName("channel")
            .setDescription("The channel the reactrole group is in")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The title of the reactrole group to modify")
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
            .setDescription("The channel containing the reactrole group")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("title")
            .setDescription("The title of the reactrole group to modify")
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName("new_title")
            .setDescription("The new title of the reactrole group")
    )
    .addStringOption((opt) =>
        opt
            .setName("desc")
            .setDescription("The description for the reactrole group")
    )
    .addStringOption((opt) =>
        opt
            .setName("color")
            .setDescription(
                "The color to set the reactrole group to, in the format FFFFFF"
            )
    )
    .addStringOption((opt) =>
        opt
            .setName("msg")
            .setDescription("The message to prepend to the reactrole group")
    );

const reactroles = new SlashCommandBuilder()
    .setName("reactroles")
    .setDescription("Create and manage reactroles, messages that allow users to assign themselves roles.")
    .addSubcommand(create)
    .addSubcommand(add_role)
    .addSubcommand(remove_role)
    .addSubcommand(edit);

export default {
    commands: {
        chat: {
            base: reactroles,
            subcommands: {
                create,
                add_role,
                remove_role,
                edit
            }
        },
        message: {}
    }
} satisfies CommandBundle<"Subcommand">;
