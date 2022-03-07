import VerifyEntry from 'entities/VerifyEntry';
import { CommandInteraction, Formatters, TextChannel } from "discord.js";
import VerifySettings from "entities/VerifySettings";
import { SlashCommandFunction } from "types/CommandTypes";
import { patterns } from "util/regexes";
import LeekClient from "../../LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "rescan",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        if (!inter.guildId) return;

        const em = client.orm.em.fork();

        const settings = await em.findOne(VerifySettings, { gid: inter.guildId });
        if (!settings) {
            inter.reply("Verification must be enabled first.");
            return;
        }

        const ch = await client.channels.fetch(settings.join_ch);
        if (!ch || ch.type !== "GUILD_TEXT") {
            inter.reply(`${Formatters.channelMention(settings.join_ch)} was not found, check that the channel exists or update your settings, then try again`);
            return;
        }

        const entries = await em.find(VerifyEntry, { gid: inter.guildId });

        const messages = await ch.messages.fetch({ limit: 100 });
        const validMsgs = messages
            .sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp)
            .filter((msg, key, coll) => {
                const isUser = msg.author.bot === false;
                const nickMatch = msg.content.match(patterns.VERIFY_REGEX) !== null;
                const unverified = msg.member?.roles.cache.hasAny(...settings.roles) === false;
                const noExistingEntry = entries.find(e => e.uid === msg.author.id) === undefined;
                const unique = key === coll.find(m => m.author.id === msg.author.id)?.id
 
                return isUser && nickMatch && unverified && noExistingEntry && unique;
            })

        validMsgs.forEach(msg => {
            const match = msg.content.match(patterns.VERIFY_REGEX)!;

            let nick = "";
            if (match.groups!.vrc_team) {
                nick = `${match.groups!.nick.slice(0, 32 - match.groups!.vrc_team.length)}｜${match.groups!.vrc_team}`;
            } else {
                nick = `${match.groups!.nick.slice(0, 32 - match.groups!.vexu_team.length)}｜${match.groups!.vexu_team}`;
            }

            em.persistAndFlush(new VerifyEntry(inter.guildId!, msg.author.id, nick))
        });

        inter.reply("Rescan complete, verification list updated.")
    }
}

export default command;
