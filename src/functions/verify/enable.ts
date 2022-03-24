import { CommandInteraction } from "discord.js";
import VerifySettings from "entities/VerifySettings";
import { SlashCommandFunction } from "types/CommandTypes";
import LeekClient from "../../LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "enable",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        if (!inter.guildId) {
            inter.reply("An unexpected error occured.");
            return;
        }

        const join_ch = inter.options.getChannel("join_channel", true);
        const role = inter.options.getRole("role", true);
        const autogreet = inter.options.getBoolean("autogreet", false) ?? false;

        const em = client.orm.em.fork();
        const settings = await em.findOne(VerifySettings, {
            gid: inter.guildId,
        });

        if (settings) {
            inter.reply("Verification is already enabled.");
            return;
        }

        em.persistAndFlush(
            new VerifySettings(inter.guildId, join_ch.id, [role.id], autogreet)
        );

        inter.reply("Verification enabled.");
    },
};

export default command;
