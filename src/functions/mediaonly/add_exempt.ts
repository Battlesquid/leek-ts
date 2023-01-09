import { CommandInteraction, Permissions } from "discord.js";
import ChannelSettings from "#entities/ChannelSettings";
import { SlashCommandFunction } from "#types/CommandTypes";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "mediaonly",
    subcommand: "add_exempt",
    perms: [Permissions.FLAGS.MANAGE_GUILD],
    execute: async (client: LeekClient, inter: CommandInteraction) => {
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

        if (settings.exempted_roles.includes(role.id)) {
            inter.reply("Role is already exempted.");
            return;
        }

        settings.exempted_roles.push(role.id);
        em.flush();

        inter.reply(`${role} is now exempted from media only channels`);
    },
};

export default command;
