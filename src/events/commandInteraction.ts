import { Interaction } from "discord.js";
import { Event } from "types/EventTypes";
import LeekClient from "../LeekClient";

const event: Event = {
    id: "commandInteraction",
    eventName: "interactionCreate",
    handle: async (client: LeekClient, inter: Interaction) => {
        if (!inter.isCommand()) return;

        const command = client.getSlashCommand(inter)
        if (!command) {
            inter.reply("An error occurred...(how did you get here?)")
            return;
        }

        command(client, inter)
    },
}

export default event;
