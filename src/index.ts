import { LogLevel, SapphireClient, container } from "@sapphire/framework";
import { ActivityType, GatewayIntentBits, Partials } from "discord.js";
import { config } from "./config";
import { getDatabase } from "./db";
import { getLoggerInstance } from "./logger/logger";
import { PinoLoggerAdapter } from "./logger/pino_logger_adapter";

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

async function main() {
    container.drizzle = await getDatabase();
    await client.login(config.getenv("DISCORD_TOKEN"));
}

main()
    .catch((error) => {
        container.logger.error(error);
    })
    .finally(async () => {
        // await container.prisma.$disconnect();
    });
