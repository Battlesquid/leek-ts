import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { ChannelType } from "discord-api-types"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("enable")
        .setDescription("Enable new member verification")
        .addChannelOption(option =>
            option
                .setName("join_channel")
                .setDescription("Where new users join")
                .addChannelType(ChannelType.GuildText)
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("approve_channel")
                .setDescription("Where staff will approve users.")
                .addChannelType(ChannelType.GuildText)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to give on approval")
        )
        .addBooleanOption(option =>
            option
                .setName("autogreet")
                .setDescription("Automatically generate a welcome message for verified users")
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(VerifySettings);
        let settings = await repo.findOne({ gid: inter.guildId });

        if (settings) {
            inter.reply("Verification is already enabled.");
            return;
        }

        const role = inter.options.getRole("role", false)
        const rArray = role ? [role.id] : [];

        settings = repo.create({
            gid: inter.guildId,
            join_ch: inter.options.getChannel("join_channel", true).id,
            appr_ch: inter.options.getChannel("approve_channel", true).id,
            roles: rArray,
            autogreet: inter.options.getBoolean("autogreet", false) ?? false
        });

        repo.save(settings);

        inter.reply("Verification enabled.");
    }
}

export default command;