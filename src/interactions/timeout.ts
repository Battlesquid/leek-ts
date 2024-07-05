import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandBundle } from ".";

const timeout = new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user")
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

export default {
    commands: {
        chat: {
            base: timeout,
            subcommands: undefined
        },
        message: {}
    }
} satisfies CommandBundle<"Command">;
