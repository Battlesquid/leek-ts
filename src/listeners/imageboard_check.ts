import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { URL_REGEX } from "../utils";
import { Message } from "discord.js";

@ApplyOptions<Listener.Options>({
    event: Events.MessageCreate
})
export class ImageboardCheckListener extends Listener {
    async run(msg: Message) {
        if (!msg.inGuild()) {
            return;
        }

        const settings = await this.container.prisma.imageboard.findFirst({
            where: { gid: msg.guildId }
        });
        if (settings === null) {
            return;
        }

        const roles = msg.member?.roles.cache;

        const hasNoLink = !URL_REGEX.test(msg.content);
        const hasNoAttachments = msg.attachments.size === 0;
        const locked = settings.boards.includes(msg.channel.id);
        const notWhitelisted = !roles?.hasAny(...settings.whitelist);

        if (locked && hasNoLink && hasNoAttachments && notWhitelisted) {
            msg.delete();
        }
    }
}
