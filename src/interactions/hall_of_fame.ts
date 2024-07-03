import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { ApplicationCommandType, ChannelType, ContextMenuCommandBuilder } from "discord.js";
import { CommandBundle } from "interactions";

const enable = new SlashCommandSubcommandBuilder()
    .setName("enable")
    .setDescription("Enable hall of fame on a given channel.")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to enable.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

const disable = new SlashCommandSubcommandBuilder()
    .setName("disable")
    .setDescription("Disable hall of fame on a given channel")
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription("The channel to disable")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
    );

const hallOfFame = new SlashCommandBuilder()
    .setName("hall_of_fame")
    .setDescription(
        "For recording noteworthy server content."
    )
    .addSubcommand(enable)
    .addSubcommand(disable);

const promote = new ContextMenuCommandBuilder()
    .setName("Add to Hall of Fame")
    .setType(ApplicationCommandType.Message);

export default {
    commands: {
        chat: {
            base: hallOfFame,
            subcommands: {
                enable,
                disable
            }
        },
        message: {
            promote
        }
    }
} satisfies CommandBundle<"Subcommand">;


export enum HallOfFameIds {
    SELECT = "hall-of-fame-select"
}