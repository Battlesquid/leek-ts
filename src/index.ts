import { Intents } from "discord.js";
import config from "./config.json";
import { LeekClient } from "./LeekClient";

const client = new LeekClient({
    commandsDir: "./commands",
    eventsDir: "./events",
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

client.start(config.DISCORD_BOT_TOKEN)