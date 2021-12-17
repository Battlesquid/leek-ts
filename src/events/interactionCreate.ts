import { Interaction } from "discord.js";
import { dispatch } from "../handlers/interactionDispatch";
import { LeekClient } from "../LeekClient";
import { Handler } from "../types";

export const handler: Handler = async (client: LeekClient, inter: Interaction) => {
    dispatch(client, inter)
}