import ChannelSettings from "#entities/ChannelSettings";
import { SlashCommandFunction } from "#types/CommandTypes";
import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "mediaonly",
    subcommand: "remove_exempt",
    perms: [PermissionsBitField.Flags.ManageGuild],
    execute: async (client: LeekClient, inter: ChatInputCommandInteraction) => {
        if (!inter.guildId) {
            inter.reply("An unexpected error occured");
            return;
        }

        const role = inter.options.getRole("role", true);

        const orm = await client.orm;
        const em = orm.em.fork();
        const settings = await em.findOne(ChannelSettings, {
            gid: inter.guildId,
        });

        if (!settings) {
            inter.reply("You must set up a media only channel first.");
            return;
        }

        settings.exempted_roles = settings.exempted_roles.filter(r => r !== role.id);
        em.flush();

        inter.reply(`${role} is no longer exempted from media only channels`);
    },
};

export default command;
