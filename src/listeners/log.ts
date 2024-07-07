import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { isNullish, isNullishOrEmpty } from "@sapphire/utilities";
import axios from "axios";
import { Attachment, Colors, EmbedBuilder, Message, MessageCreateOptions, TextChannel } from "discord.js";
import { eq } from "drizzle-orm";
import { logSettings } from "../db/schema";
import { AugmentedListener } from "../utils";
import { ttry } from "../utils/try";

const fetchImage = (url: string) => {
    return new Promise<Buffer>((resolve, reject) => {
        const bytes: Uint8Array[] = [];
        axios
            .request({
                method: "get",
                url,
                responseType: "stream"
            })
            .then((response) => {
                // TODO make sure this works
                response.data.on("data", (d: Uint8Array) => bytes.push(d));
                response.data.on("end", () => {
                    resolve(Buffer.concat(bytes));
                });
            })
            .catch((e) => reject(e));
    });
};

const createPayload = async (attachment: Attachment, message: Message<true>): Promise<MessageCreateOptions | null> => {
    const match = attachment.contentType?.match(/png|jpg|jpeg|gif|webp/);
    if (!match) {
        return null;
    }
    const [ext] = match;
    let buffer: Buffer;
    try {
        buffer = await fetchImage(attachment.proxyURL);
    } catch (error) {
        return null;
    }
    const embed = new EmbedBuilder()
        .setTitle("Image Deleted")
        .setDescription(`Sent by ${message.member} in ${message.channel}`)
        .setColor(Colors.DarkRed)
        .setImage(`attachment://deleted.${ext}`)
        .setTimestamp(Date.now());
    return {
        embeds: [embed],
        files: [
            {
                attachment: buffer,
                name: `deleted.${ext}`,
                description: `deleted by ${message.member} in ${message.channel}`
            }
        ]
    };
};

// TODO add support for plain urls
const handleImageLog = async (message: Message<true>, imageChannel: string) => {
    const channel = (await message.guild.channels.fetch(imageChannel)) as TextChannel | null;
    if (channel === null) {
        return;
    }

    try {
        const results = (await Promise.all(message.attachments.map((a) => createPayload(a, message)))).filter((r): r is MessageCreateOptions => r !== null);
        results.forEach(async (payload) => {
            try {
                await channel.send(payload);
            } catch (error) {
                return;
            }
        });
    } catch (error) {
        return;
    }
};

const handleMessageLog = async (message: Message<true>, textChannel: string) => {
    if (isNullishOrEmpty(message.content)) {
        return;
    }

    const channel = (await message.guild.channels.fetch(textChannel)) as TextChannel | null;
    if (channel === null) {
        return;
    }

    const msgs = await message.channel.messages.fetch({
        before: message.id,
        limit: 1
    });
    const first = msgs.first();
    const context = first ? `[Context](${first.url})` : "`No context available`";

    const embed = new EmbedBuilder()
        .setTitle("Message Deleted")
        .setDescription(`Sent by ${message.author} in ${message.channel}\n${context}`)
        .addFields({ name: "Content", value: message.content, inline: false })
        .setColor(Colors.DarkRed)
        .setTimestamp(Date.now());
    try {
        await channel.send({ embeds: [embed] });
    } catch (error) {
        return;
    }
};

@ApplyOptions<Listener.Options>({
    event: Events.MessageDelete
})
export class LogListener extends AugmentedListener<"messageDelete"> {
    async run(msg: Message) {
        if (!msg.inGuild()) {
            return;
        }

        const { result: settings, ok } = await ttry(() =>
            this.db.query.logSettings.findFirst({
                where: eq(logSettings.gid, msg.guildId)
            })
        );
        if (isNullish(settings) || !ok) {
            return;
        }

        if (settings.image) {
            ttry(() => handleImageLog(msg, settings.image!));
        }
        if (settings.message) {
            ttry(() => handleMessageLog(msg, settings.message!));
        }
    }
}
