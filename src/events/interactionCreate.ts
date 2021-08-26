import { Interaction } from "discord.js";
import { Handler } from "../types";

export const handler: Handler =  async(interaction: Interaction) => {
    if(!interaction.isCommand()) return;

    // const name = interaction.commandName;
}