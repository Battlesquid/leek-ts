import axios from "axios";
import { Message, EmbedBuilder, Colors, ChannelType } from "discord.js";
import LogSettings from "#entities/LogSettings";
import { Stream } from "stream";
import { Event } from "#types/EventTypes";
import LeekClient from "../LeekClient";

const event: Event<"messageDelete"> = {
    eventName: "messageDelete",
    handle: async (client: LeekClient, msg: Message) => {
        if (!msg.guild) return;

        const orm = await client.orm;
        const em = orm.em.fork();
        const settings = await em.findOne(LogSettings, {
            gid: msg.guildId,
        });

        if (!settings) return;

        if (settings.i_log_ch) {
            const ch = await msg.guild?.channels.fetch(settings.i_log_ch);
            if (!ch || ch.type !== ChannelType.GuildText) return;

            // TODO add support for plain urls

            msg.attachments
                .filter(
                    (attach) =>
                        attach.contentType?.match("png|jpg|jpeg|gif|webp") !==
                        null
                )
                .forEach(async (attach) => {
                    const bytes: Uint8Array[] = [];
                    const response = await axios.request<Stream>({
                        method: "get",
                        url: attach.proxyURL,
                        responseType: "stream",
                    });
                    response.data.on("data", (d) => bytes.push(d));
                    response.data.on("end", () => {
                        const buffer = Buffer.concat(bytes);
                        const ext =
                            attach.contentType?.match(
                                "png|jpg|jpeg|gif|webp"
                            ) ?? "png";

                        const embed = new EmbedBuilder()
                            .setTitle("Image Deleted")
                            .setDescription(
                                `Sent by ${msg.member} in ${msg.channel}`
                            )
                            .setColor(Colors.DarkRed)
                            .setImage(`attachment://deleted.${ext}`)
                            .setTimestamp(Date.now());

                        ch.send({
                            embeds: [embed],
                            files: [
                                {
                                    attachment: buffer,
                                    name: `deleted.${ext}`,
                                    description: `deleted by ${msg.member} in ${msg.channel}`,
                                },
                            ],
                        });
                    });
                });
        }

        if (settings.t_log_ch) {
            const ch = await msg.guild?.channels.fetch(settings.t_log_ch);
            if (!ch || ch.type !== ChannelType.GuildText) return;

            const msgs = await msg.channel.messages.fetch({
                before: msg.id,
                limit: 1,
            });

            const first = msgs.first();
            const context = first
                ? `[Jump to context](${first.url})`
                : `\`No context available\``;

            const embed = new EmbedBuilder()
                .setTitle("Message Deleted")
                .setDescription(
                    `
                    Sent by ${msg.author} in ${msg.channel}
                    
                    ${msg.content}
                    
                    ${context}
                    `
                )
                .setColor(Colors.DarkRed)
                .setTimestamp(Date.now());
            ch.send({ embeds: [embed] });
        }
    },
};

export default event;
