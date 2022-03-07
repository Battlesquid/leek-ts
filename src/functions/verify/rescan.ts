import { CommandInteraction } from "discord.js";
import { SlashCommandFunction } from "types/CommandTypes";
import LeekClient from "../../LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "rescan",
    execute: async (client: LeekClient, inter: CommandInteraction) => {

    }
}

export default command;
