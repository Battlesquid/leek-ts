import "module-alias/register";

import env from "dotenv";
import path from "path";
env.config({ path: path.resolve(__dirname, "../.env") })

import { PrismaClient } from "@prisma/client";
import { SapphireClient, container } from '@sapphire/framework';
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    presence: {
        status: "online",
        activities: [
            {
                type: ActivityType.Playing,
                name: '/help',
            },
        ],
    },
    
});


async function main() {
    container.prisma = new PrismaClient();
    await container.prisma.$connect();
    await client.login(process.env.DISCORD_BOT_TOKEN);
}

main()
    .finally(async () => {
        await container.prisma.$disconnect()
    })

