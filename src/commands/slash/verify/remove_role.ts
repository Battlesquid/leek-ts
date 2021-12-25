import { SlashCommandSubcommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import { getRepository } from "typeorm"
import VerifySettings from "../../../database/entities/VerifySettings"

export default {
    structure: new SlashCommandSubcommandBuilder()
        .setName("remove_role")
        .setDescription("Remove a role from the list of roles")
        .addChannelOption(option =>
            option
                .setName("role")
                .setDescription("The role to remove")
                .setRequired(true)
        ),

    execute: async (inter: CommandInteraction) => {
        const repo = getRepository(VerifySettings);
        const settings = await repo.findOne({ gid: inter.guildId });
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const role = inter.options.getRole("role", true);
        const existingRole = settings.roles.find(r => r === role.id);

        if (!existingRole) {
            inter.reply(`Role list does not include ${role}`);
            return;
        }

        settings.roles = settings.roles.filter(r => r !== role.id);

        repo.save(settings);

        inter.reply(`Added ${role} to the list of roles.`);
    }
}