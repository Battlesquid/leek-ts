import { Intents } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import config from "./config.json";
import { LeekClient } from "./LeekClient";

const client = new LeekClient({
    commandsDir: "./commands",
    eventsDir: "./events",
    subeventsDir: "./subevents",
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    presence: {
        status: "dnd",
        activities: [{ type: ActivityTypes.PLAYING, name: "I've been updated! Type \"\/\" to see what I can do." }]
    }
});

client.start(config.DISCORD_BOT_TOKEN)