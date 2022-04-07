import { CommandInteraction } from "discord.js";
import { SlashCommandFunction } from "#types/CommandTypes";
import VerifySettings from "../../entities/VerifySettings";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "set_autogreet",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const orm = await client.orm;
        const em = orm.em.fork();

        const settings = await em.findOne(VerifySettings, {
            gid: inter.guildId,
        });
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const autogreet = inter.options.getBoolean("autogreet", true);

        settings.autogreet = autogreet;
        em.flush();

        inter.reply(`Autogreet set to ${autogreet}`);
    },
};

export default command;
