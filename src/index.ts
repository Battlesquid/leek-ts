import { LogLevel, SapphireClient, container } from "@sapphire/framework";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config";
import { getDatabase, getPgPool } from "./db";
import { getLoggerInstance } from "./logger";
import { PinoLoggerAdapter } from "./utils/bot";

const logger = getLoggerInstance("leekbot");

const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
    logger: {
        level: config.getenv("NODE_ENV") === "development" ? LogLevel.Trace : LogLevel.Info,
        instance: new PinoLoggerAdapter(logger)
    },
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    presence: {
        status: "online",
        activities: [
            {
                type: ActivityType.Watching,
                name: "out for leeks"
            }
        ]
    }
});

const main = async () => {
    container.drizzle = await getDatabase();
    container.pool = await getPgPool();
    await client.login(config.getenv("DISCORD_TOKEN"));
};

const cleanup = () => {
    container.pool.end();
};

main().catch((error) => {
    container.logger.error(error);
});

process.on("uncaughtException", (error) => {
    console.error(error);
    cleanup();
});

process.on("SIGTERM", () => {
    cleanup();
    process.exit(0);
});

process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
});
