import { CommandInteraction } from "discord.js"
import VerifySettings from "entities/VerifySettings"
import { SlashCommandFunction } from "types/CommandTypes"
import LeekClient from "../../LeekClient"

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "add_role",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: inter.guildId });
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

        em.flush();

        inter.reply(`Added ${role} to the list of roles.`);
    }
}

export default command;
