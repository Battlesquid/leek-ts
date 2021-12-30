import { Message } from "discord.js";
import { getRepository } from "typeorm";
import VerifyList from "../database/entities/VerifyLists";
import VerifySettings from "../database/entities/VerifySettings";
import { SubEvent } from "../types/EventTypes";
import { patterns } from "../util/regexes";

const subevent: SubEvent = {
    name: "verifyRequest",
    parent: "messageCreate",
    handleLoc: "pre",
    async meetsReqs(message: Message) {
        if (!message.guildId) return false;
        if(message.author.bot) return false;

        const match = message.content.match(patterns.VERIFY_REGEX);
        if (!match) return false;

        const repo = getRepository(VerifySettings);
        const settings = await repo.findOne({ gid: message.guildId })
        if (!settings) return false;

        return message.channelId === settings.join_ch;
    },
    async handle(message: Message) {
        if (!message.guildId) return;
        const match = message.content.match(patterns.VERIFY_REGEX);
        if (!match) return;

        let nick = "";
        if (match.groups!.vrc_team)
            nick = `${match.groups!.nick.slice(0, 32 - match.groups!.vrc_team.length)}｜${match.groups!.vrc_team}`;
        else
            nick = `${match.groups!.nick.slice(0, 32 - match.groups!.vexu_team.length)}｜${match.groups!.vexu_team}`;

        const repo = getRepository(VerifyList);
        let settings = await repo.findOne({ gid: message.guildId })
        if (!settings) {
            settings = repo.create({
                gid: message.guildId,
                users: [{ id: message.author.id, nick }]
            })
        } else {
            settings.users = settings.users.filter(f => f.id !== message.author.id)
            settings.users.push({ id: message.author.id, nick });
        }

        repo.save(settings);
    }
}

export default subevent;