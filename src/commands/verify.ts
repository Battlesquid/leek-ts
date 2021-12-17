import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export const structure = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Puts users on a waitlist to enter the server.")
    .addSubcommand(subcmd =>
        subcmd
            .setName("enable")
            .setDescription("Enable new member verification")
            .addChannelOption(option =>
                option
                    .setName("new_user_channel")
                    .setDescription("Where new users join")
                    .setRequired(true)
            )
            .addChannelOption(option =>
                option
                    .setName("approval_channel")
                    .setDescription("Where staff will approve users.")
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName("role")
                    .setDescription("Role to give on approval")
                    .setRequired(true)
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
            .setDescription("Display verification list")
    )
    .addSubcommand(subcmd =>
        subcmd
            .setName("autowelcome")
            .setDescription("Automatically generate a welcome message for verified users")
            .addBooleanOption(option =>
                option
                    .setName("boolean")
                    .setDescription("True to enable, false to disable")
                    .setRequired(true)
            )
    )


export const execute = (inter: CommandInteraction) => {

}