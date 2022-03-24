import { SlashCommandBuilder } from "@discordjs/builders";

const timeoutInteraction = new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user")
    .setDefaultPermission(false)
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("The user to timeout")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("duration")
            .setDescription("How long this user should be timed out for.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription("The reason for timing this user out")
    );

export default timeoutInteraction;
