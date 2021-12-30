import { MessageReaction, User } from "discord.js";
import { LeekClient } from "../LeekClient";
import { Event } from "../types/EventTypes";

const event: Event = {
    name: "messageReactionRemove",
    handle(client: LeekClient, reaction: MessageReaction, user: User) {

    }
}

export default event;