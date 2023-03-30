import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "path/posix";
const env = config({ path: path.resolve(__dirname, "../.env") })
expand(env)

import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import LeekClient from "./LeekClient";

const client = new LeekClient({
    interactionsDir: path.resolve(__dirname, "./interactions"),
    functionsDir: path.resolve(__dirname, "./functions"),
    eventsDir: path.resolve(__dirname, "./events"),
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    presence: {
        status: "dnd",
        activities: [
            {
                type: ActivityType.Playing,
                name: 'I\'ve been updated! Type "/" to see what I can do.',
            },
        ],
    },
});

client.start();
