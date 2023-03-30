import { SlashCommandFunction } from "#types/CommandTypes";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import LeekClient from "LeekClient";
import VerifySettings from "../../entities/VerifySettings";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "set_autogreet",
    perms: [PermissionsBitField.Flags.ManageGuild],
    execute: async (client: LeekClient, inter: ChatInputCommandInteraction) => {
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
