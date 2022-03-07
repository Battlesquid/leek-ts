import { Client } from "discord.js";
import { Event } from "types/EventTypes";
import LeekClient from "../LeekClient";

const event: Event = {
    id: "ready",
    eventName: "ready",
    once: true,
    handle: async (client: LeekClient, origClient: Client) => {
        console.log("loading complete, leek online.")
    }
}

export default event;