import { Interaction } from "discord.js";
import { dispatch } from "../handlers/interactionDispatch";
import { LeekClient } from "../LeekClient";
import { Event } from "../types/EventTypes";

const event: Event = {
    name: "interactionCreate",
    handle: async (client: LeekClient, inter: Interaction) => {
        dispatch(client, inter)
    }
}

export default event;