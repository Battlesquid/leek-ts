import { Command } from '@sapphire/framework';
import { timeoutInteraction } from '@interactions';
import ms from 'ms';

export class TimeoutCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'timeout',
            description: "Timeout users",
            preconditions: ["GuildTextOnly"]
        });
    }

    public override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(timeoutInteraction, {
            idHints: ["950533839120367626"]
        })
    }

    public override async chatInputRun(inter: Command.ChatInputCommandInteraction<"cached" | "raw">) {
        const user = inter.options.getUser("user", true);
        const duration = inter.options.getString("duration", true);
        const reason = inter.options.getString("reason", false) ?? undefined;

        try {
            const millis = ms(duration);
            const durationStr = ms(millis);

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

            await member
                .disableCommunicationUntil(Date.now() + millis, reason)
            inter.reply(`Timed out ${user} for ${durationStr}`);
        } catch (e) {
            inter.reply("An invalid duration was provided.");
            return;
        }
    }
}