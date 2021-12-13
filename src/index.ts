import config from "./config.json"

import { Client, Intents } from "discord.js"
import { loadCommands, loadEvents } from "./loaders"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

loadCommands("./commands");
loadEvents(client, "./events")

client.login(config.DISCORD_BOT_TOKEN)