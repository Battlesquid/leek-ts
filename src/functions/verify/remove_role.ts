import { CommandInteraction } from "discord.js"
import { SlashCommandFunction } from "types/CommandTypes"
import VerifySettings from "../../entities/VerifySettings"
import LeekClient from "../../LeekClient"

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "remove_role",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: inter.guildId });
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

        em.flush();

        inter.reply(`Added ${role} to the list of roles.`);
    }
}

export default command