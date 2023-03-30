import { SlashCommandFunction } from "#types/CommandTypes";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import LeekClient from "LeekClient";
import VerifySettings from "../../entities/VerifySettings";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "set_join_ch",
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

        const ch = inter.options.getChannel("channel", true);

        settings.join_ch = ch.id;
        em.flush();

        inter.reply(`Join channel set to ${ch}`);
    },
};

export default command;
