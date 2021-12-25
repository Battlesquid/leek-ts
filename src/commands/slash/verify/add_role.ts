import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"
import { LeekClient } from "../../../LeekClient"
import { Subcommand } from "../../../types"

const command: Subcommand = {
    structure: new SlashCommandSubcommandBuilder()
        .setName("add_role")
        .setDescription("Add a role to the list of roles")
        .addChannelOption(option =>
            option
                .setName("role")
                .setDescription("A role to give to verified users")
                .setRequired(true)
        ),

    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const repo = getRepository(VerifySettings);
        const settings = await repo.findOne({ gid: inter.guildId });
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const role = inter.options.getRole("role", true);
        const existingRole = settings.roles.find(r => r === role.id);

        if (existingRole) {
            inter.reply(`${role} is already included.`);
            return;
        }

        settings.roles.push(role.id);

        repo.save(settings);

        inter.reply(`Added ${role} to the list of roles.`);
    }
}

export default command;