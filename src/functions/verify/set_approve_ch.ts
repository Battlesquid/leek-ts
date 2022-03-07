import VerifySettings from "entities/VerifySettings"
import { CommandInteraction } from "discord.js"
import { SlashCommandFunction } from "types/CommandTypes"
import LeekClient from "../../LeekClient"

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "set_approve_ch",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: inter.guildId })
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        settings.notif_ch = inter.options.getChannel("channel", true).id

        em.flush();

        inter.reply(`Join channel set to ${inter.options.getChannel("channel", true)}`)
    }
}

export default command;
