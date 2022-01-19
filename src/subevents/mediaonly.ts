import { Message } from "discord.js";
import { getRepository } from "typeorm";
import ChannelSettings from "../database/entities/ChannelSettings";
import { patterns } from "../util/regexes";
import { SubEvent } from "../types/EventTypes";

const subevent: SubEvent = {
    name: "mediaOnly",
    parent: "messageCreate",
    handleLoc: "pre",
    async handle(msg: Message) {
        const repo = getRepository(ChannelSettings);
        try {
            const settings = await repo.findOneOrFail({ gid: msg.guildId });

            const hasNoLink = !(patterns.URL_REGEX.test(msg.content));
            const hasNoAttachments = msg.attachments.size === 0;
            const locked = settings.media_only_chs.includes(msg.channel.id);

            if (locked && hasNoLink && hasNoAttachments)
                msg.delete()
        } catch (e) {
            // no settings
            return;
        }
    }
}

export default subevent;