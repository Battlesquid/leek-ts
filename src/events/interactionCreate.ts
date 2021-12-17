import { Interaction } from "discord.js";
import { LeekClient } from "../LeekClient";
import { Handler } from "../types";

export const handler: Handler = async (client: LeekClient, interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    const name = interaction.commandName;
    console.log(interaction.options.getSubcommand());
    console.log(name)
    interaction.reply("lmao")
}