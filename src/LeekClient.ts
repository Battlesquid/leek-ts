import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, ClientOptions } from "discord.js";
import promises from "fs/promises";
import path from "path";
import config from "./config.json";
import { Command, EventHandler } from "./types";

interface LeekClientOptions extends ClientOptions {
    commandDir: string
    eventsDir: string
}

const rest = new REST({ version: config.DISCORD_REST_VER }).setToken(config.DISCORD_BOT_TOKEN);

export class LeekClient extends Client {
    public options: LeekClientOptions;

    constructor(options: LeekClientOptions) {
        super(options);
        this.options = options;
    }

    start(token: string) {
        this.loadCommands()
        this.loadEvents()
        this.login(token);
    }

    private async getCommands(): Promise<Command[]> {
        const resolvedPath = path.resolve(__dirname, this.options.commandDir)
        const files = await promises.readdir(resolvedPath)
        const commands = []
        for (const file of files) {
            const command: Command = await import(`${resolvedPath}/${file}`)
            commands.push(command)
        }
        return commands
    }

    private async loadCommands() {
        try {
            console.log('Started refreshing application (/) commands.');

            const commands = await this.getCommands();
            const resolvedCommands = commands.map(cmd => cmd.structure.toJSON());

            console.log(`Loading commands [${commands.map(c => c.structure.name).join(", ")}]`)
            await rest.put(
                Routes.applicationCommands(config.DISCORD_CLIENT_ID),
                { body: resolvedCommands },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }

    private async loadEvents() {
        const resolvedPath = path.resolve(__dirname, this.options.eventsDir)
        const eventNames = (await promises.readdir(resolvedPath)).map(n => n.split(".")[0])
        console.log(`Loading events [${eventNames.join(", ")}]`)
        for (const eventName of eventNames) {
            const event: EventHandler = await import(`${resolvedPath}/${eventName}`)
            this.on(eventName, event.handler.bind(null, this))
        }
    }
}