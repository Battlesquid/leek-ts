import { CommandInteraction } from "discord.js";
import ms from "ms";
import LeekClient from "LeekClient";
import { SlashCommandFunction } from "#types/CommandTypes";

const command: SlashCommandFunction = {
    name: "timeout",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const user = inter.options.getUser("user", true);
        const duration = inter.options.getString("duration", true);
        const reason = inter.options.getString("reason", false) ?? undefined;

        try {
            const millis = ms(duration);
            const durationStr = ms(millis);
            console.log(millis);

            if (millis < 0) {
                inter.reply("Duration must be a positive value");
                return;
            }

            if (millis > ms("28 days")) {
                inter.reply("Duration must be shorter than 28 days");
                return;
            }

            if (Number.isNaN(millis)) {
                inter.reply(`Invalid duration ${duration}`);
                return;
            }

            const member = await inter.guild?.members.fetch(user.id);
            if (!member) {
                inter.reply(`Unable to find ${user}, please try again later.`);
                return;
            }

            member
                .disableCommunicationUntil(Date.now() + millis, reason)
                .then(() => inter.reply(`Timed out ${user} for ${durationStr}`))
                .catch(() =>
                    inter.reply("An error occured, make sure I have permission")
                );
        } catch (e) {
            inter.reply(
                "An invalid duration was provided, please provide a valid duration, then try again."
            );
            return;
        }
    },
};

export default command;
