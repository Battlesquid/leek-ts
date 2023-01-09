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

        const roles = msg.member?.roles.cache;

        const hasNoLink = !patterns.URL_REGEX.test(msg.content);
        const hasNoAttachments = msg.attachments.size === 0;
        const locked = settings.media_only.includes(msg.channel.id);
        const notExempted = !roles?.hasAny(...settings.exempted_roles);

        if (locked && hasNoLink && hasNoAttachments && notExempted) {
            msg.delete();
        }
    },
};

export default event;
