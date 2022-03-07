import { Message, MessageEmbed, TextChannel } from "discord.js";
import LogSettings from 'entities/LogSettings';
import { Event } from "types/EventTypes";
import LeekClient from "../LeekClient";

const event: Event = {
  id: "messageDeleteLogCapture",
  eventName: "messageDelete",
  handle: async (client: LeekClient, msg: Message) => {
    if (!msg.guild) return;

    const em = client.orm.em.fork();
    const settings = await em.findOne(LogSettings, { gid: msg.guildId });

    if (!settings) return;

    if (settings.t_log_ch) {
      const ch = await msg.guild?.channels.fetch(settings.t_log_ch) as TextChannel;
      if (!ch) return;

      const contextMsgs = await msg.channel.messages.fetch({ before: msg.id, limit: 4 });
      const links = Array.from(contextMsgs)
        .map(([str, msg], i) => `[[${i + 1}]](${msg.url})`)
        .join(" ");

      const embed = new MessageEmbed()
        .setTitle("Message Deleted")
        .setDescription(`
        **Sent by ${msg.author} in ${msg.channel}**
        ${msg.content}

        **Context:** ${links}
        `)
        .setColor("DARK_RED")
        .setTimestamp(Date.now())
      ch.send({ embeds: [embed] })
    }
  }
}

export default event;