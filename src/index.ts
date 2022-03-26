// import "module-alias/register";
import { Intents } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path/posix";
import LeekClient from "./LeekClient";

const env = config({path: path.resolve(__dirname, "../.env")})
expand(env)

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

client.start();
