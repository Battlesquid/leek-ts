import { CommandInteraction } from "discord.js"
import VerifySettings from "../../entities/VerifySettings"
import LeekClient from "../../LeekClient"
import { SlashCommandFunction } from "types/CommandTypes"

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "disable",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: inter.guildId })
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }
        em.removeAndFlush(settings)
        inter.reply("Verification disabled.")
    }
}

export default command;
