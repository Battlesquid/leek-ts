import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord.js";
import { CommandBundle } from ".";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable new member verification")
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of verification to enable")
            .addChoices({ name: "message", value: "message" }, { name: "command", value: "command" })
            .setRequired(true)
    )
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("Role to give on approval")
            .setRequired(true)
    )
    .addChannelOption((option) =>
        option
            .setName("new_user_channel")
            .setDescription("The channel where new users first arrive. Only used for message verification.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
    )
    .addBooleanOption((option) =>
        option
            .setName("create_greeting")
            .setDescription("Automatically create a copyable greeting message upon verification")
    );

const disable = new SlashCommandSubcommandBuilder().setName("disable").setDescription("Disable verification");

const list = new SlashCommandSubcommandBuilder().setName("list").setDescription("Display pending verifications");

const rescan = new SlashCommandSubcommandBuilder().setName("rescan").setDescription("Rescans the user join channel");

const add_role = new SlashCommandSubcommandBuilder()
    .setName("add_role")
    .setDescription("Add a role to the list of roles")
    .addRoleOption((option) => option.setName("role").setDescription("A role to give to verified users").setRequired(true));

const remove_role = new SlashCommandSubcommandBuilder()
    .setName("remove_role")
    .setDescription("Remove a role from the list of roles")
    .addRoleOption((option) => option.setName("role").setDescription("The role to remove").setRequired(true))
    .addRoleOption((option) => option.setName("replacement_role").setDescription("Role to use as replacement if there is only one verification role.").setRequired(false));

const edit = new SlashCommandSubcommandBuilder()
    .setName("edit")
    .setDescription("Edit verification settings.")
    .addChannelOption((option) =>
        option
            .setName("new_user_channel")
            .setDescription("The channel where new users first arrive.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
    )
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of verification to enable")
            .addChoices({ name: "message", value: "message" }, { name: "command", value: "command" })
            .setRequired(false)
    )
    .addBooleanOption((option) =>
        option
            .setName("create_greeting")
            .setDescription("Automatically create a copyable greeting message upon verification")
            .setRequired(false)
    );

const request = new SlashCommandSubcommandBuilder()
    .setName("request")
    .setDescription("Request verification. Only applicable if command verification is enabled.");

const verify = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Allows server staff to approve users into the server")
    .addSubcommand(enable)
    .addSubcommand(disable)
    .addSubcommand(list)
    .addSubcommand(rescan)
    .addSubcommand(add_role)
    .addSubcommand(remove_role)
    .addSubcommand(edit)
    .addSubcommand(request);

export default {
    commands: {
        chat: {
            base: verify,
            subcommands: {
                enable,
                disable,
                list,
                rescan,
                add_role,
                remove_role,
                edit,
                request
            }
        },
        message: {}
    }
} satisfies CommandBundle<"Subcommand">;
