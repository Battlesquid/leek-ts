import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord.js";
import { CommandBundle } from "interactions";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable new member verification")
    .addStringOption((opt) =>
        opt
            .setName("type")
            .setDescription("The type of verification to enable")
            .addChoices({ name: "Self Verification", value: "self" }, { name: "Staff Verification", value: "staff" })
            .setRequired(true)
    )
    .addChannelOption((option) => option.setName("join_channel").setDescription("Where new users join").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addRoleOption((option) => option.setName("role").setDescription("Role to give on approval").setRequired(true))
    .addBooleanOption((option) => option.setName("autogreet").setDescription("Automatically generate a greeting message for verified users"));

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
    .addRoleOption((option) => option.setName("role").setDescription("The role to remove").setRequired(true));

const edit = new SlashCommandSubcommandBuilder()
    .setName("edit")
    .setDescription("Edit verification settings.")
    .addChannelOption((option) => option.setName("channel").setDescription("The channel where new users join.").addChannelTypes(ChannelType.GuildText).setRequired(false))
    .addBooleanOption((option) => option.setName("create_greeting").setDescription("Whether to automatically create a copyable greeting message upon verification").setRequired(false));

const request = new SlashCommandSubcommandBuilder().setName("request").setDescription("Request verification");

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
