import { CommandInteraction } from "discord.js";
import VerifySettings from "#entities/VerifySettings";
import { SlashCommandFunction } from "#types/CommandTypes";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "remove_role",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, {
            gid: inter.guildId,
        });
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const role = inter.options.getRole("role", true);
        const existingRole = settings.roles.find((r) => r === role.id);

        if (!existingRole) {
            inter.reply(`Role list does not include ${role}`);
            return;
        }

        if (settings.roles.length === 1) {
            inter.reply(
                `Minimum role size reached. Add more roles, then try again.`
            );
            return;
        }
        settings.roles = settings.roles.filter((r) => r !== role.id);

        em.flush();

        inter.reply(`Removed ${role} from the list of roles.`);
    },
};

export default command;
