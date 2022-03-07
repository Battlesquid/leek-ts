import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types";

const verifyInteraction = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Allows server staff to approve users into the server")
    .addSubcommand(subcmd =>
        subcmd
            .setName("enable")
            .setDescription("Enable new member verification")
            .addChannelOption(option =>
                option
                    .setName("join_channel")
                    .setDescription("Where new users join")
                    .addChannelType(ChannelType.GuildText)
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName("role")
                    .setDescription("Role to give on approval")
                    .setRequired(true)
            )
            .addChannelOption(option =>
                option
                    .setName("notify_channel")
                    .setDescription("Channel to send daily verification reminders")
                    .addChannelType(ChannelType.GuildText)
            )
            .addBooleanOption(option =>
                option
                    .setName("autogreet")
                    .setDescription("Automatically generate a greeting message for verified users")
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("disable")
            .setDescription("Disable verification")
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("list")
            .setDescription("Display pending verifications")
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("rescan")
            .setDescription("Rescans the user join channel")
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("add_role")
            .setDescription("Add a role to the list of roles")
            .addRoleOption(option =>
                option
                    .setName("role")
                    .setDescription("A role to give to verified users")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("remove_role")
            .setDescription("Remove a role from the list of roles")
            .addRoleOption(option =>
                option
                    .setName("role")
                    .setDescription("The role to remove")
                    .setRequired(true)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("set_join_ch")
            .setDescription("Set the join channel.")
            .addChannelOption(option =>
                option
                    .setName("channel")
                    .setDescription("The channel where new users join.")
                    .addChannelType(ChannelType.GuildText)
                    .setRequired(true)
            )
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("set_autogreet")
            .setDescription("Automatically generate a welcome message for verified users")
            .addBooleanOption(option =>
                option
                    .setName("autogreet")
                    .setDescription("True to enable, false to disable")
                    .setRequired(true)
            )
    )

export default verifyInteraction;