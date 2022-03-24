import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable new member verification")
    .addChannelOption((option) =>
        option
            .setName("join_channel")
            .setDescription("Where new users join")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    )
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("Role to give on approval")
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("autogreet")
            .setDescription(
                "Automatically generate a greeting message for verified users"
            )
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Disable verification");

const list = new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("Display pending verifications");

const rescan = new SlashCommandSubcommandBuilder()
    .setName("rescan")
    .setDescription("Rescans the user join channel");

const add_role = new SlashCommandSubcommandBuilder()
    .setName("add_role")
    .setDescription("Add a role to the list of roles")
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("A role to give to verified users")
            .setRequired(true)
    );

const remove_role = new SlashCommandSubcommandBuilder()
    .setName("remove_role")
    .setDescription("Remove a role from the list of roles")
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true)
    );

const set_join_ch = new SlashCommandSubcommandBuilder()
    .setName("set_join_ch")
    .setDescription("Set the join channel.")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel where new users join.")
            .addChannelType(ChannelType.GuildText)
            .setRequired(true)
    );

const set_autogreet = new SlashCommandSubcommandBuilder()
    .setName("set_autogreet")
    .setDescription(
        "Automatically generate a welcome message for verified users"
    )
    .addBooleanOption((option) =>
        option
            .setName("autogreet")
            .setDescription("True to enable, false to disable")
            .setRequired(true)
    );

const verifyInteraction = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Allows server staff to approve users into the server")
    .setDefaultPermission(false)
    .addSubcommand(enable)
    .addSubcommand(disable)
    .addSubcommand(list)
    .addSubcommand(rescan)
    .addSubcommand(add_role)
    .addSubcommand(remove_role)
    .addSubcommand(set_join_ch)
    .addSubcommand(set_autogreet);

export default verifyInteraction;
