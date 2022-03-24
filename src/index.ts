import { Intents } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import path from "path/posix";
import config from "./config.json";
import LeekClient from "./LeekClient";

const client = new LeekClient({
    interactionsDir: path.resolve(__dirname, "./interactions"),
    functionsDir: path.resolve(__dirname, "./functions"),
    eventsDir: path.resolve(__dirname, "./events"),
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    presence: {
        status: "dnd",
        activities: [
            {
                type: ActivityTypes.PLAYING,
                name: 'I\'ve been updated! Type "/" to see what I can do.',
            },
        ],
    },
});

client.start(config.DISCORD_BOT_TOKEN);
