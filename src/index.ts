import { LogLevel, SapphireClient, container } from "@sapphire/framework";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config";
import { getDatabase, getPgConnection } from "./db";
import { getLoggerInstance } from "./logger";
import { PinoLoggerAdapter } from "./utils/bot";

const logger = getLoggerInstance("leekbot");

const client = new SapphireClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions],
    logger: {
        level: config.getenv("NODE_ENV") === "development" ? LogLevel.Debug : LogLevel.Info,
        instance: new PinoLoggerAdapter(logger)
    },
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    presence: {
        status: "online",
        activities: [
            {
                type: ActivityType.Playing,
                name: "/help"
            }
        ]
    }
});

const main = async () => {
    container.drizzle = await getDatabase();
    container.pg = await getPgConnection();
    await client.login(config.getenv("DISCORD_TOKEN"));
};

const cleanup = () => {
    container.pg.end();
};

main().catch((error) => {
    container.logger.error(error);
});

process.on("uncaughtException", () => {
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
