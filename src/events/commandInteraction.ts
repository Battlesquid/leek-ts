import { Interaction } from "discord.js";
import { Event } from "types/EventTypes";
import LeekClient from "../LeekClient";

const event: Event<"interactionCreate"> = {
    eventName: "interactionCreate",
    handle: async (client: LeekClient, inter: Interaction) => {
        if (!inter.isCommand()) return;

        const command = client.getSlashCommand(inter);
        if (!command) {
            inter.reply(
                "Command function not found, it may have been removed or moved somwhere else."
            );
            return;
        }

        command(client, inter);
    },
};

export default event;
