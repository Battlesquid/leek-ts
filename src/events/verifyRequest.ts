/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Message } from "discord.js";
import VerifyEntry from "../entities/VerifyEntry";
import { Event } from "#types/EventTypes";
import { patterns } from "#util/regexes";
import LeekClient from "../LeekClient";
import VerifySettings from "#entities/VerifySettings";

const event: Event<"messageCreate"> = {
    eventName: "messageCreate",
    async handle(client: LeekClient, message: Message) {
        if (!message.guildId) return;

        if (message.author.bot) return;

        const match = message.content.match(patterns.VERIFY_REGEX);
        if (!match) return;

        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: message.guildId })
        if(!settings) return;

        if(message.channelId !== settings.join_ch) return;

        const { nick, team } = match.groups!;
        const trimmedNick = nick.slice(0, 29 - team.length);
        const formattedNick = `${trimmedNick} | ${team}`;

        const entry = await em.findOne(VerifyEntry, {
            gid: message.guildId,
            uid: message.author.id,
        });
        if (entry) {
            entry.nick = formattedNick;
            em.flush();
        } else {
            em.persistAndFlush(
                new VerifyEntry(
                    message.guildId,
                    message.author.id,
                    formattedNick
                )
            );
        }
    },
};

export default event;
