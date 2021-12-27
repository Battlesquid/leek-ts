import { Message } from "discord.js";
import { getRepository } from "typeorm";
import ChannelSettings from "../database/entities/ChannelSettings";
import { patterns } from "../util/regexes";
import { SubEvent } from "../types/EventTypes";

const subevent: SubEvent = {
    name: "mediaOnly",
    parent: "messageCreate",
    handleLoc: "pre",
    async meetsReqs(msg: Message) {
        if (!msg.guildId) return false;

        const repo = getRepository(ChannelSettings);
        try {
            const settings = await repo.findOneOrFail({ gid: msg.guildId });

            const hasNoLink = !(patterns.URL_REGEX.test(msg.content));
            const hasNoAttachments = msg.attachments.size === 0;
            const locked = settings.media_only_chs.includes(msg.channel.id);

            return (locked && hasNoLink && hasNoAttachments);
        } catch(e) {
            // no settings
            return false;
        }
    },
    handle(msg: Message) {
        msg.delete()
    }
}

export default subevent;