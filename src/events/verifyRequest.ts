import { Message } from "discord.js";
import VerifyEntry from "../entities/VerifyEntry";
import { Event } from "types/EventTypes";
import { patterns } from "util/regexes";
import LeekClient from "../LeekClient";

const event: Event = {
    id: "verifyRequest",
    eventName: "messageCreate",
    async handle(client: LeekClient, message: Message) {
        if (!message.guildId) return;

        if (message.author.bot) return;

        const match = message.content.match(patterns.VERIFY_REGEX);
        if (!match) return;

        const em = client.orm.em.fork();
        let nick = "";
        if (match.groups!.vrc_team)
            nick = `${match.groups!.nick.slice(0, 32 - match.groups!.vrc_team.length)}｜${match.groups!.vrc_team}`;
        else
            nick = `${match.groups!.nick.slice(0, 32 - match.groups!.vexu_team.length)}｜${match.groups!.vexu_team}`;
        
        const entry = await em.findOne(VerifyEntry, { gid: message.guildId, uid: message.author.id });
        if(entry) {
            entry.nick = nick;
            em.flush();
        } else {
            em.persistAndFlush(new VerifyEntry(message.guildId, message.author.id, nick));
        }
    }
}

export default event;