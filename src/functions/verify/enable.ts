import { CommandInteraction } from "discord.js"
import VerifySettings from "../../entities/VerifySettings"
import LeekClient from "../../LeekClient"
import { SlashCommandFunction } from "types/CommandTypes"

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
        const notif_ch = inter.options.getChannel("notify_channel", false) ?? null;
        const autogreet = inter.options.getBoolean("autogreet", false) ?? false;

        const em = client.orm.em.fork();
        const settings = await em.findOne(VerifySettings, { gid: inter.guildId });

        if (settings) {
            inter.reply("Verification is already enabled.");
            return;
        }

        em.persistAndFlush(new VerifySettings(inter.guildId, join_ch.id, [role.id], notif_ch?.id, autogreet));

        inter.reply("Verification enabled.");
    }
}

export default command;