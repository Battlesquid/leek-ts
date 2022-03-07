import { CommandInteraction } from "discord.js"
import { SlashCommandFunction } from "types/CommandTypes"
import VerifySettings from "../../entities/VerifySettings"
import LeekClient from "../../LeekClient"

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "set_autogreet",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: inter.guildId })
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        settings.autogreet = inter.options.getBoolean("autogreet", true)
        em.flush();

        inter.reply(`Autogreet set to ${inter.options.getBoolean("autogreet", true)}`)
    }
}

export default command;
