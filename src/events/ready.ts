import { Client } from "discord.js";
import { LeekClient } from "../LeekClient";
import { Handler } from "./types";

export const handler: Handler = async (client: LeekClient, origClient: Client) => {
    console.log("loading complete, leek online.")
}