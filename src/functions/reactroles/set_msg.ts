import { CommandInteraction, TextChannel } from "discord.js";
import { SlashCommandFunction } from "types/CommandTypes";
import LeekClient from "../../LeekClient";

const command: SlashCommandFunction = {
    name: "reactroles",
    subcommand: "set_msg",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const msgContent = inter.options.getString("msg", false) ?? "";

        const messages = await ch.messages.fetch({ limit: 50 });
        const msg = messages.find((m) => {
            if (!m.embeds.length) return false;
            if (m.embeds[0].title !== title) return false;
            if (!m.embeds[0].footer) return false;
            if (!m.embeds[0].footer.text.match("reactroles")) return false;
            if (!client.user) return false;
            if (!m.author.equals(client.user)) return false;
            return true;
        });
        if (!msg) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }

        if (msgContent === "") {
            msg.edit({ content: null });
            inter.reply(`Removed message from ${title}`);
        } else {
            msg.edit(msgContent);
            inter.reply(`Updated ${title}'s message to ${msgContent}`);
        }
    },
};

export default command;
