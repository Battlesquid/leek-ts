import { Message } from "discord.js";
import { Event } from "types/EventTypes";
import { patterns } from "util/regexes";
import ChannelSettings from "../entities/ChannelSettings";
import LeekClient from "../LeekClient";

const event: Event = {
    id: "mediaOnly",
    eventName: "messageCreate",
    async handle(client: LeekClient, msg: Message) {
        const em = client.orm.em.fork();

        try {
            const settings = await em.findOneOrFail(ChannelSettings, { gid: msg.guildId });

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

export default event;