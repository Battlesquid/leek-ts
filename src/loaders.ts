import config from "./config.json"

import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v9";
import { Client } from "discord.js";
import { promises } from "fs";
import path from "path";

import type { Command, EventHandler } from "./types";
import type { SlashCommandBuilder } from "@discordjs/builders";

const rest = new REST({ version: '9' }).setToken(config.DISCORD_BOT_TOKEN);

const getCommands = async (dir: string): Promise<SlashCommandBuilder[]> => {
    const resolvedPath = path.resolve(__dirname, dir)
    const files = await promises.readdir(resolvedPath)
    const commands = []
    for (const file of files) {
        const command: Command = await import(`${resolvedPath}/${file}`)
        commands.push(command.structure)
    }
    return commands
}

export const loadCommands = async (dir: string) => {
    try {
        console.log('Started refreshing application (/) commands.');

        const commands = await getCommands(dir);
        const resolvedCommands = commands.map(cmd => cmd.toJSON());

        if (!config.DISCORD_CLIENT_ID) return;

        await rest.put(
            Routes.applicationCommands(config.DISCORD_CLIENT_ID),
            { body: resolvedCommands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};

export const loadEvents = async (client: Client, dir: string) => {
    const resolvedPath = path.resolve(__dirname, dir)
    const eventNames = await promises.readdir(resolvedPath)
    console.log(eventNames)
    // for (const eventName of eventNames) {
    //     const event: EventHandler = await import(`${resolvedPath}/${eventName}`)
    //     client.on(eventName, event.handler)
    // }
}