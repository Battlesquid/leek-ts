import { Client } from "discord.js";
import { LeekClient } from "../LeekClient";
import { Event } from "../types/EventTypes";

const event: Event = {
    name: "ready",
    once: true,
    handle: async (client: LeekClient, origClient: Client) => {
        console.log("loading complete, leek online.")
    }

}

export default event;