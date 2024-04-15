import { Listener } from "@sapphire/framework";
import axios from "axios";
import { Colors, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Stream } from "stream";

function fetchImage(url: string) {
    return new Promise<Buffer>((resolve, reject) => {
        const bytes: Uint8Array[] = [];
        axios.request<Stream>({
            method: "get",
            url,
            responseType: "stream",
        })
            .then(response => {
                response.data.on("data", (d) => bytes.push(d));
                response.data.on("end", () => {
                    resolve(Buffer.concat(bytes));
                });
            })
            .catch(e => reject(e));
    });
}

async function processImageLog(msg: Message<true>, img_ch: string) {
    const ch = await msg.guild.channels.fetch(img_ch) as TextChannel | null;
    if (ch === null) {return;}

    // TODO add support for plain urls

    msg.attachments
        .map(attach => {
            const ext = attach.contentType?.match("png|jpg|jpeg|gif|webp") ?? null;
            if (ext === null) {
                return undefined;
            }
            return {
                url: attach.proxyURL,
                ext
            };
        })
        .forEach(async (attach) => {
            if (attach === undefined) {return;}

            const buffer = await fetchImage(attach.url);

            const embed = new EmbedBuilder()
                .setTitle("Image Deleted")
                .setDescription(
                    `Sent by ${msg.member} in ${msg.channel}`
                )
                .setColor(Colors.DarkRed)
                .setImage(`attachment://deleted.${attach.ext}`)
                .setTimestamp(Date.now());

            ch.send({
                embeds: [embed],
                files: [
                    {
                        attachment: buffer,
                        name: `deleted.${attach.ext}`,
                        description: `deleted by ${msg.member} in ${msg.channel}`,
                    },
                ],
            });
        });
}

async function processTextLog(msg: Message<true>, txt_ch: string) {
    const ch = await msg.guild.channels.fetch(txt_ch) as TextChannel | null;
    if (ch === null) {return;}

    const msgs = await msg.channel.messages.fetch({
        before: msg.id,
        limit: 1,
    });

    const first = msgs.first();
    const context = first
        ? `[Jump to context](${first.url})`
        : "`No context available`";

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

export class LogListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageDelete",
        });
    }
    async run(msg: Message) {
        if (!msg.inGuild()) {return;}

        const settings = await this.container.prisma.logSettings.findFirst({
            where: { gid: msg.guildId }
        });
        if (settings === null) {return;}

        if (settings.image) {
            processImageLog(msg, settings.image);
        }
        if (settings.text) {
            processTextLog(msg, settings.text);
        }
    }
}