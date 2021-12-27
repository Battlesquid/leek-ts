import { Message } from "discord.js";
import { LeekClient } from "../LeekClient";
import { Event } from "../types/EventTypes";

const event: Event = {
    name: "messageCreate",
    handle(client: LeekClient, msg: Message) {
        // console.log(`${msg.author.username} | ${msg.content}`)
    }
}

export default event;