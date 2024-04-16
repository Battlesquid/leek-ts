import { Listener } from "@sapphire/framework";
import { patterns } from "@utils";
import { Message } from "discord.js";

export class ImageboardCheckListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageCreate",
        });
    }
    async run(msg: Message) {
        if (!msg.inGuild()) {return;}

        const settings = await this.container.prisma.imageboard.findFirst({
            where: { gid: msg.guildId }
        });
        if (settings === null) {return;}

        const roles = msg.member?.roles.cache;

        const hasNoLink = !patterns.URL_REGEX.test(msg.content);
        const hasNoAttachments = msg.attachments.size === 0;
        const locked = settings.boards.includes(msg.channel.id);
        const notWhitelisted = !roles?.hasAny(...settings.whitelist);

        if (locked && hasNoLink && hasNoAttachments && notWhitelisted) {
            msg.delete();
        }
    }
}
