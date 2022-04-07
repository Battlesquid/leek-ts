import { CommandInteraction } from "discord.js";
import { SlashCommandFunction } from "#types/CommandTypes";
import VerifySettings from "../../entities/VerifySettings";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "set_join_ch",
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

        const ch = inter.options.getChannel("channel", true);

        settings.join_ch = ch.id;
        em.flush();

        inter.reply(`Join channel set to ${ch}`);
    },
};

export default command;
