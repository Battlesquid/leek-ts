/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandInteraction, Formatters, MessageMentions, Permissions } from "discord.js";
import VerifyEntry from "#entities/VerifyEntry";
import VerifySettings from "#entities/VerifySettings";
import { SlashCommandFunction } from "#types/CommandTypes";
import { patterns } from "#util/regexes";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "verify",
    subcommand: "rescan",
    perms: [Permissions.FLAGS.MANAGE_GUILD],
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        if (!inter.guildId) return;
        await inter.deferReply()

        const orm = await client.orm;
        const em = orm.em.fork();

        const settings = await em.findOne(VerifySettings, {
            gid: inter.guildId,
        });
        if (!settings) {
            inter.editReply("Verification must be enabled first.");
            return;
        }

        const ch = await client.channels.fetch(settings.join_ch);
        if (!ch || ch.type !== "GUILD_TEXT") {
            inter.editReply(
                `${Formatters.channelMention(
                    settings.join_ch
                )} was not found, check that the channel exists or update your settings, then try again`
            );
            return;
        }

        const entries = await em.find(VerifyEntry, { gid: inter.guildId });

        const messages = await ch.messages.fetch({ limit: 100 });

        const validMsgs = messages
            .sort((msg1, msg2) => msg2.createdTimestamp - msg1.createdTimestamp)
            .filter((msg, key, coll) => {
                const isUser = msg.author.bot === false;
                const nickMatch =
                    msg.content.match(patterns.VERIFY_REGEX) !== null;
                const noExistingEntry =
                    entries.find((e) => e.uid === msg.author.id) === undefined;
                const unique =
                    key === coll.find((m) => m.author.id === msg.author.id)?.id;

                return (
                    isUser &&
                    nickMatch &&
                    noExistingEntry &&
                    unique
                );
            });


        await Promise.all(Array.from(validMsgs.values()).map(async (msg) => {
            const member = await msg.guild?.members.fetch(msg.author.id)
            const verified = member?.roles.cache.hasAny(...settings.roles);
            if (verified) return;

            const match = msg.content.match(patterns.VERIFY_REGEX)!;
            const { nick, team } = match.groups!;

            const trimmedNick = nick
                .replace(MessageMentions.USERS_PATTERN, "")
                .replace(MessageMentions.CHANNELS_PATTERN, "")
                .replace(MessageMentions.EVERYONE_PATTERN, "")
                .slice(0, 29 - team.length);
            const formattedNick = `${trimmedNick} | ${team}`;

            em.persistAndFlush(
                new VerifyEntry(inter.guildId!, msg.author.id, formattedNick)
            );
        }));

        inter.editReply("Rescan complete, verification list updated.");
    },
};

export default command;
