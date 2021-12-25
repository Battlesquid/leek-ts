import { Message } from "discord.js";
import { getRepository } from "typeorm";
import ChannelSettings from "../database/entities/ChannelSettings";
import { Subevent } from "./types";
import { patterns } from "../util/regexes";

const subevent: Subevent = {
    name: "txtInTextDisabled",
    parent: "messageCreate",
    meetsReq: async (msg: Message) => {
        if (!msg.guildId) return false;
        const repo = getRepository(ChannelSettings)
        const settings = await repo.findOne({ gid: msg.guildId })

        // check if settings doesn't exist OR if it does and
        // there are channels in txt_disabled
        return settings?.txt_disabled.length ? true : false;
    },
    tryExec: async (msg: Message) => {
        if (!msg.guildId) return false;
        const repo = getRepository(ChannelSettings);
        const settings = await repo.findOne({ gid: msg.guildId });
        if (!settings) return;
        if (!settings.txt_disabled.length) return;
        if (!settings.txt_disabled.find(id => id === msg.channel.id)) return;

        const hasNoLink = !(patterns.URL_REGEX.test(msg.content));
        const hasNoAttachments = msg.attachments.size === 0;

        if (hasNoLink || hasNoAttachments)
            msg.delete()
    }
}

export default subevent;