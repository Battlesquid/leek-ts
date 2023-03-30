import { Event } from "#types/EventTypes";
import logger from "#util/logger/logger";
import { Interaction, TextChannel } from "discord.js";
import LeekClient from "../LeekClient";

const event: Event<"interactionCreate"> = {
    eventName: "interactionCreate",
    handle: async (client: LeekClient, inter: Interaction) => {
        if (!inter.isChatInputCommand()) return;
        try {
            const command = client.getSlashCommand(inter);

            logger.info({
                command: { cmd: command?.key.name, subcmd: command?.key.subcommand },
                guild: { id: inter.guildId, name: inter.guild?.name },
                channel: { id: inter.channelId, name: (inter.channel as TextChannel).name },
                user: { id: inter.user.id, name: inter.user.username }
            });

            if (!command || !command.fn) {
                inter.reply(
                    "Command function not found, it may have been removed or moved somwhere else."
                );
                return;
            }

            if (!inter.memberPermissions?.has(command.key.perms)) {
                inter.reply("You do not have permission to use that command.");
                return;
            }

            command.fn(client, inter);
        } catch (e) {
            logger.error({ event: e })
        }
    },
};

export default event;
