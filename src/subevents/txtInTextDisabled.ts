import { Message } from "discord.js";
import { getRepository } from "typeorm";
import ChannelSettings from "../database/entities/ChannelSettings";
import { patterns } from "../util/regexes";
import { SubEvent } from "../types/EventTypes";

const subevent: SubEvent = {
    name: "txtInDisabled",
    parent: "messageCreate",
    async meetsReqs(msg: Message){
        if (!msg.guildId) return false;
        const repo = getRepository(ChannelSettings);
        const settings = await repo.findOne({ gid: msg.guildId });
        if (!settings) return false;

        const hasNoLink = !(patterns.URL_REGEX.test(msg.content));
        const hasNoAttachments = msg.attachments.size === 0;
        const locked = settings.txt_disabled.includes(msg.channel.id);
        return (locked && hasNoLink && hasNoAttachments);
    },
    handle(msg: Message) {
        msg.delete()
    }
}

export default subevent;