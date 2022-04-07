import { Message } from "discord.js";
import { Event } from "#types/EventTypes";
import { patterns } from "#util/regexes";
import ChannelSettings from "#entities/ChannelSettings";
import LeekClient from "LeekClient";

const event: Event<"messageCreate"> = {
    eventName: "messageCreate",
    async handle(client: LeekClient, msg: Message) {
        const orm = await client.orm;
        const em = orm.em.fork();

        const settings = await em.findOne(ChannelSettings, {
            gid: msg.guildId,
        });
        if (!settings) return;

        const hasNoLink = !patterns.URL_REGEX.test(msg.content);
        const hasNoAttachments = msg.attachments.size === 0;
        const locked = settings.media_only.includes(msg.channel.id);

        if (locked && hasNoLink && hasNoAttachments) {
            msg.delete();
        }
    },
};

export default event;
