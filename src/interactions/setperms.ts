import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

const user = new SlashCommandSubcommandBuilder()
    .setName("user")
    .setDescription("Set the permission level for a specific user")
    .addStringOption((option) =>
        option
            .setName("command")
            .setDescription("The command to target")
            .addChoices([
                ["all", "all"],
                ["verify", "verify"],
                ["reactroles", "reactroles"],
                ["logs", "logs"],
                ["mediaonly", "mediaonly"],
            ])
            .setRequired(true)
    )
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("The user to target")
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("allowed")
            .setDescription("Whether to allow this user to use this command")
            .setRequired(true)
    );

const role = new SlashCommandSubcommandBuilder()
    .setName("role")
    .setDescription("Set the permission level for a specific role")
    .addStringOption((option) =>
        option
            .setName("command")
            .setDescription("The command to target")
            .addChoices([
                ["all", "all"],
                ["verify", "verify"],
                ["reactroles", "reactroles"],
                ["logs", "logs"],
                ["mediaonly", "mediaonly"],
            ])
            .setRequired(true)
    )
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The role to target")
            .setRequired(true)
    )
    .addBooleanOption((option) =>
        option
            .setName("allowed")
            .setDescription("Whether to allow this role to use this command")
            .setRequired(true)
    );

const permsInteraction = new SlashCommandBuilder()
    .setName("setperms")
    .setDescription(
        "Set the permission level for a role or user on a specific command"
    )
    .addSubcommand(user)
    .addSubcommand(role);

export default permsInteraction;
